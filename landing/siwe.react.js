// @flow

import {
  useConnectModal,
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
  useModalState,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import invariant from 'invariant';
import _merge from 'lodash/fp/merge';
import * as React from 'react';
import '@rainbow-me/rainbowkit/dist/index.css';
import { useAccount, useSigner, WagmiConfig } from 'wagmi';

import type { SIWEWebViewMessage } from 'lib/types/siwe-types';
import {
  getSIWEStatementForPublicKey,
  siweStatementWithoutPublicKey,
  siweMessageSigningExplanationStatements,
  createSIWEMessage,
} from 'lib/utils/siwe-utils.js';
import { configureWagmiChains, createWagmiClient } from 'lib/utils/wagmi-utils';

import { SIWEContext } from './siwe-context.js';
import css from './siwe.css';

const { chains, provider } = configureWagmiChains(process.env.COMM_ALCHEMY_KEY);
const { connectors } = getDefaultWallets({ appName: 'comm', chains });
const wagmiClient = createWagmiClient({ connectors, provider });

function postMessageToNativeWebView(message: SIWEWebViewMessage) {
  window.ReactNativeWebView?.postMessage?.(JSON.stringify(message));
}

async function signInWithEthereum(
  address: string,
  signer,
  nonce: string,
  statement: string,
) {
  invariant(nonce, 'nonce must be present in signInWithEthereum');
  const message = createSIWEMessage(address, statement, nonce);
  const signature = await signer.signMessage(message);
  postMessageToNativeWebView({
    type: 'siwe_success',
    address,
    message,
    signature,
  });
}

function SIWE(): React.Node {
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const { siweNonce, siwePrimaryIdentityPublicKey } = React.useContext(
    SIWEContext,
  );
  const onClick = React.useCallback(() => {
    invariant(siweNonce, 'nonce must be present during SIWE attempt');
    const statement = siwePrimaryIdentityPublicKey
      ? getSIWEStatementForPublicKey(siwePrimaryIdentityPublicKey)
      : siweStatementWithoutPublicKey;
    signInWithEthereum(address, signer, siweNonce, statement);
  }, [address, signer, siweNonce, siwePrimaryIdentityPublicKey]);

  const { openConnectModal } = useConnectModal();
  const hasNonce = siweNonce !== null && siweNonce !== undefined;
  React.useEffect(() => {
    if (hasNonce && openConnectModal) {
      openConnectModal();
    }
  }, [hasNonce, openConnectModal]);

  const prevConnectModalOpen = React.useRef(false);
  const modalState = useModalState();
  const { connectModalOpen } = modalState;
  React.useEffect(() => {
    if (!connectModalOpen && prevConnectModalOpen.current && !signer) {
      postMessageToNativeWebView({ type: 'siwe_closed' });
    }
    prevConnectModalOpen.current = connectModalOpen;
  }, [connectModalOpen, signer]);

  const newModalAppeared = React.useCallback(mutationList => {
    for (const mutation of mutationList) {
      for (const addedNode of mutation.addedNodes) {
        if (
          addedNode instanceof HTMLElement &&
          addedNode.id === 'walletconnect-wrapper'
        ) {
          postMessageToNativeWebView({
            type: 'walletconnect_modal_update',
            state: 'open',
          });
        }
      }
      for (const addedNode of mutation.removedNodes) {
        if (
          addedNode instanceof HTMLElement &&
          addedNode.id === 'walletconnect-wrapper'
        ) {
          postMessageToNativeWebView({
            type: 'walletconnect_modal_update',
            state: 'closed',
          });
        }
      }
    }
  }, []);

  React.useEffect(() => {
    const observer = new MutationObserver(newModalAppeared);
    invariant(document.body, 'document.body should be set');
    observer.observe(document.body, { childList: true });
    return () => {
      observer.disconnect();
    };
  }, [newModalAppeared]);

  if (!hasNonce) {
    return (
      <div className={css.wrapper}>
        <h1 className={css.h1}>Unable to proceed: nonce not found.</h1>
      </div>
    );
  } else if (!signer) {
    return null;
  } else {
    return (
      <div className={css.wrapper}>
        <div className={css.walletDisplay}>
          <span className={css.walletDisplayText}>Wallet Connected:</span>
          <ConnectButton />
        </div>
        <p>{siweMessageSigningExplanationStatements[0]}</p>
        <p>{siweMessageSigningExplanationStatements[1]}</p>
        <div className={css.button} onClick={onClick}>
          Sign in
        </div>
      </div>
    );
  }
}

function SIWEWrapper(): React.Node {
  const theme = React.useMemo(() => {
    return _merge(darkTheme())({
      radii: {
        modal: 0,
        modalMobile: 0,
      },
      colors: {
        modalBackdrop: '#242529',
      },
    });
  }, []);
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider theme={theme} modalSize="compact" chains={chains}>
        <SIWE />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default SIWEWrapper;

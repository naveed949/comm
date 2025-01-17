// @flow

import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import * as React from 'react';
import { useProvider } from 'wagmi';

import { ENSCacheProvider } from 'lib/components/ens-cache-provider.react';
import { configureWagmiChains, createWagmiClient } from 'lib/utils/wagmi-utils';

const { chains, provider } = configureWagmiChains(process.env.COMM_ALCHEMY_KEY);
const { connectors } = getDefaultWallets({ appName: 'comm', chains });
const wagmiClient: mixed = createWagmiClient({ connectors, provider });
const wagmiChains: mixed = chains;

type Props = {
  +children: React.Node,
};
function WagmiENSCacheProvider(props: Props): React.Node {
  const { children } = props;
  const wagmiProvider = useProvider();
  return (
    <ENSCacheProvider provider={wagmiProvider}>{children}</ENSCacheProvider>
  );
}

export { wagmiClient, wagmiChains, WagmiENSCacheProvider };

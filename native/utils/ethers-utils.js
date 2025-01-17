// @flow

import '@ethersproject/shims';

import { ethers } from 'ethers';

import type { EthersProvider } from 'lib/utils/ens-cache';

let alchemyKey;
try {
  // $FlowExpectedError: file might not exist
  const { key } = require('../facts/alchemy.json');
  alchemyKey = key;
} catch {}

const provider: EthersProvider = new ethers.providers.AlchemyProvider(
  'mainnet',
  alchemyKey,
);

export { provider };

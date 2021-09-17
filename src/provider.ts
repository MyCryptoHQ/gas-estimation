import type { ProviderLike } from '@mycrypto/eth-scan';
import { send } from '@mycrypto/eth-scan';

import type { Block, FeeHistory } from './types';

export const getBlock = (provider: ProviderLike, blockNumber: string | number): Promise<Block> =>
  send<Block>(provider, 'eth_getBlockByNumber', [blockNumber, false]);

export const getLatestBlock = (provider: ProviderLike): Promise<Block> =>
  getBlock(provider, 'latest');

export const getFeeHistory = (
  provider: ProviderLike,
  blockCount: string,
  newestBlock: string,
  rewardPercentiles?: number[]
): Promise<FeeHistory> =>
  send<FeeHistory>(provider, 'eth_feeHistory', [blockCount, newestBlock, rewardPercentiles ?? []]);

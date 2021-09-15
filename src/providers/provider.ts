import type { Block, FeeHistory, WrappedProvider } from '../types';
import { createJsonRpcRequest } from '../utils';
import type { ProviderLike } from './providers';
import { selectProvider } from './providers';

export const wrapProvider = (rawProvider: ProviderLike): WrappedProvider | null => {
  const provider = selectProvider(rawProvider);
  if (provider === undefined) {
    return null;
  }

  const getBlock = (blockNumber: string | number) =>
    provider.send<Block>(
      rawProvider,
      createJsonRpcRequest('eth_getBlockByNumber', [blockNumber, false])
    );

  const getLatestBlock = () => getBlock('latest');

  const getFeeHistory = (blockCount: string, newestBlock: string, rewardPercentiles?: number[]) =>
    provider.send<FeeHistory>(
      rawProvider,
      createJsonRpcRequest('eth_feeHistory', [blockCount, newestBlock, rewardPercentiles ?? []])
    );

  return { getBlock, getLatestBlock, getFeeHistory };
};

import { createJsonRpcRequest } from '../utils';
import { selectProvider } from './providers';

export interface ProviderLike {
  send<T>(method: string, params: unknown[] | unknown): Promise<T>;
}

interface Block {
  baseFeePerGas: string;
  difficulty: string;
  extraData: string;
  gasLimit: string;
  gasUsed: string;
  hash: string;
  miner: string;
  mixHash: string;
  nonce: string;
  number: string;
  parentHash: string;
  receiptsRoot: string;
  sha3Uncles: string;
  size: string;
  stateRoot: string;
  timestamp: string;
  totalDifficulty: string;
  transactions: unknown[];
  transactionsRoot: string;
  uncles: unknown[];
}

interface FeeHistory {
  baseFeePerGas: string[];
  gasUsedRatio: number[];
  reward?: string[][];
  oldestBlock: string;
}

export interface WrappedProvider {
  getBlock(blockHashOrTag: string | number): Promise<Block>;
  getLatestBlock(): Promise<Block>;

  getFeeHistory(
    blockCount: string,
    newestBlock: string,
    rewardPercentiles?: number[]
  ): Promise<FeeHistory>;
}

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
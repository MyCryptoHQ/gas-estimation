import type { Block } from './block';
import type { FeeHistory } from './feeHistory';
import type { JsonRpcRequest } from './jsonrpc';

export interface WrappedProvider {
  getBlock(blockHashOrTag: string | number): Promise<Block>;
  getLatestBlock(): Promise<Block>;

  getFeeHistory(
    blockCount: string,
    newestBlock: string,
    rewardPercentiles?: number[]
  ): Promise<FeeHistory>;
}

export interface Provider<P> {
  isProvider(provider: unknown): provider is P;
  send<T>(provider: P, request: JsonRpcRequest): Promise<T>;
}

export type InferProviderType<P extends readonly unknown[]> = {
  [K in keyof P]: P[K] extends P[number] ? (P[K] extends Provider<infer T> ? T : never) : never;
};

export type TupleToUnion<P extends readonly unknown[]> = P[number];
export type ProviderType<P extends readonly unknown[]> = TupleToUnion<InferProviderType<P>>;

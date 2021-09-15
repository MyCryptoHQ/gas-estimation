import type { JsonRpcRequest } from './jsonrpc';

export interface Provider<P> {
  isProvider(provider: unknown): provider is P;
  send<T>(provider: P, request: JsonRpcRequest): Promise<T>;
}

export type InferProviderType<P extends readonly unknown[]> = {
  [K in keyof P]: P[K] extends P[number] ? (P[K] extends Provider<infer T> ? T : never) : never;
};

export type TupleToUnion<P extends readonly unknown[]> = P[number];
export type ProviderType<P extends readonly unknown[]> = TupleToUnion<InferProviderType<P>>;

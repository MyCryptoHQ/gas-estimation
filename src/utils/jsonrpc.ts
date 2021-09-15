import type { JsonRpcRequest } from '../types';

let id = 1;

export const createJsonRpcRequest = (method: string, params: unknown[]): JsonRpcRequest => ({
  jsonrpc: '2.0',
  method,
  params: params,
  id: id++
});

export interface JsonRpcRequest<T = unknown[]> {
  jsonrpc: string;
  method: string;
  params: T;
  id?: string | number;
}

export interface JsonRpcResult<T> {
  id: number;
  jsonrpc: string;
  result: T;
  error?: {
    code: number;
    message: string;
    data: string;
  };
}

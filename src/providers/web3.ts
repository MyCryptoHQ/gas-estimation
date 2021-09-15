import type { JsonRpcRequest, JsonRpcResult, Provider } from '../types';

export interface Web3ProviderLike {
  currentProvider: {
    send<T>(
      payload: JsonRpcRequest,
      callback: (error: Error | null, result?: JsonRpcResult<T>) => void
    ): void;
  };
}

/**
 * Web3 provider, which can be used with an instance of the Web3 class.
 */
const provider: Provider<Web3ProviderLike> = {
  isProvider: (provider: unknown): provider is Web3ProviderLike => {
    return (provider as Web3ProviderLike)?.currentProvider?.send !== undefined;
  },

  send: async <T>(provider: Web3ProviderLike, request: JsonRpcRequest): Promise<T> => {
    const { result } = await send<T>(provider, request);

    return result;
  }
};

export default provider;

export const send = <T>(
  provider: Web3ProviderLike,
  payload: JsonRpcRequest
): Promise<JsonRpcResult<T>> => {
  return new Promise((resolve, reject) => {
    provider.currentProvider.send<T>(payload, (error, result) => {
      if (error) {
        return reject(error);
      }

      if (!result) {
        return reject(new Error('No response payload'));
      }

      resolve(result);
    });
  });
};

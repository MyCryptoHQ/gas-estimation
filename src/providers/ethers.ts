import type { JsonRpcRequest, Provider } from '../types';

export interface EthersProviderLike {
  send<T>(method: string, params: unknown[] | unknown): Promise<T>;
}

/**
 * Ethers.js provider, which can be used with an instance of the Ethers.js Provider class.
 */
const provider: Provider<EthersProviderLike> = {
  isProvider: (provider: unknown): provider is EthersProviderLike => {
    return (provider as EthersProviderLike)?.send !== undefined;
  },

  send: async <T>(provider: EthersProviderLike, request: JsonRpcRequest): Promise<T> => {
    return provider.send(request.method, request.params);
  }
};

export default provider;

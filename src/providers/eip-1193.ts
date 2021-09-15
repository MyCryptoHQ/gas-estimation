import type { JsonRpcRequest, Provider } from '../types';

export interface EIP1193ProviderLike {
  request<T>(request: JsonRpcRequest): Promise<T>;
}

/**
 * EIP-1193 provider, which can be used with the `window.ethereum` object.
 */
const provider: Provider<EIP1193ProviderLike> = {
  isProvider: (provider: unknown): provider is EIP1193ProviderLike => {
    return (provider as EIP1193ProviderLike)?.request !== undefined;
  },

  send: async <T>(provider: EIP1193ProviderLike, request: JsonRpcRequest): Promise<T> => {
    return provider.request(request);
  }
};

export default provider;

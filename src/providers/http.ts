import fetch from 'isomorphic-unfetch';

import type { JsonRpcRequest, JsonRpcResult, Provider } from '../types';

interface HttpProviderOptions {
  url: string;
  params?: Partial<Omit<RequestInit, 'body' | 'method' | 'headers'>>;
}

export type HttpProviderLike = string | HttpProviderOptions;

/**
 * A raw HTTP provider, which can be used with an Ethereum node endpoint (JSON-RPC), or an `HttpProviderOptions` object.
 */
const provider: Provider<HttpProviderLike> = {
  isProvider: (provider: unknown): provider is HttpProviderLike => {
    return (
      typeof provider === 'string' ||
      (typeof provider === 'object' && (provider as HttpProviderOptions).url !== undefined)
    );
  },

  send: async <T>(provider: HttpProviderLike, request: JsonRpcRequest): Promise<T> => {
    const url = typeof provider === 'string' ? provider : provider.url;
    const options = typeof provider === 'object' ? provider.params : {};

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request),
      cache: 'no-cache',
      ...options
    });

    if (!response.ok) {
      throw new Error(
        `Contract call failed with HTTP error ${response.status}: ${response.statusText}`
      );
    }

    const { error, result }: JsonRpcResult<T> = await response.json();
    if (error) {
      throw new Error(`Contract call failed: ${error.message}`);
    }

    return result;
  }
};

export default provider;

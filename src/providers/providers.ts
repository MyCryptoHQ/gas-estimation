import type { Provider, ProviderType } from '../types';
import EIP1193Provider from './eip-1193';
import EthersProvider from './ethers';
import HttpProvider from './http';
import Web3Provider from './web3';

const PROVIDERS = [EIP1193Provider, EthersProvider, HttpProvider, Web3Provider];

export type ProviderLike = ProviderType<typeof PROVIDERS>;

export const selectProvider = (provider: ProviderLike): Provider<unknown> | undefined =>
  PROVIDERS.find((p) => p.isProvider(provider));

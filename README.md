# gas-estimation

EIP-1559 gas estimation library, using the estimation strategy of MyCrypto. The library does not depend on a third-party
API but rather fetches the historic data (for the latest 10 blocks) from a regular Ethereum node directly.

## Getting Started

The library is published on npm. To install it, you can use `npm` or `yarn`:

```text
yarn add @mycrypto/gas-estimation
```

or

```text
npm install @mycrypto/gas-estimation
```

### Example

```ts
import { estimateFees } from '@mycrypto/gas-estimation';

// Estimation using a JSON-RPC endpoint.
// Web3.js, Ethers.js and EIP-1193 providers are also supported, see the documentation.
const { maxFeePerGas, maxPriorityFeePerGas } = await estimateFees('http://127.0.0.1:8545');

console.log(maxFeePerGas, maxPriorityFeePerGas);
```

## API

The library exposes a single function to estimate gas fees based on the latest 10 blocks.

### `estimateFees(provider)`

- `provider` - A Web3 instance, Ethers.js provider, JSON-RPC endpoint, or EIP-1193 compatible provider.
- Returns: \<Promise\<EstimationResult\>\> - An object containing the estimated `maxFeePerGas`, `maxPriorityFeePerGas`, and `baseFee`, as `bigint` (all values in Wei).

### Providers

Currently, gas-estimation has support for four different providers:

- Ethers.js, by using an existing Ethers.js provider.
- Web3, by using an instance of the Web3 class.
- HTTP, by using a URL of a JSON-RPC endpoint as string.
- EIP-1193 compatible provider, like `window.ethereum`.

## Contributing

If you found a bug, have a suggestion or want to contribute in any other way, feel free to open an issue or submit a pull request. Any contributions are highly appreciated.

## Compatibility

`gas-estimation` uses ES6+ functionality, which may not be supported on all platforms. If you need compatibility with older browsers or Node.js versions, you can use something like [Babel](https://github.com/babel/babel).

There is an ES compatible version available, which should work with module bundlers like [Webpack](https://webpack.js.org/) and [Rollup](https://github.com/rollup/rollup).

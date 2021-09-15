import type BigNumber from 'bignumber.js';

export interface EstimationResult {
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
  baseFee: BigNumber | undefined;
}

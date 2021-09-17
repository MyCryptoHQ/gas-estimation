import type { ProviderLike } from '@mycrypto/eth-scan';

import { getFeeHistory, getLatestBlock } from './provider';
import type { EstimationResult } from './types';
import { gwei, hexlify, max, roundToWholeGwei } from './utils';

const MAX_GAS_FAST = gwei(1500n); // 1500 GWEI

// How many blocks to consider for priority fee estimation
const FEE_HISTORY_BLOCKS = 10;
// Which percentile of effective priority fees to include
const FEE_HISTORY_PERCENTILE = 5;
// Which base fee to trigger priority fee estimation at
const PRIORITY_FEE_ESTIMATION_TRIGGER = gwei(100n); // 100 GWEI
// Returned if above trigger is not met
const DEFAULT_PRIORITY_FEE = gwei(3n); // 3 GWEI
// In case something goes wrong fall back to this estimate
export const FALLBACK_ESTIMATE = {
  maxFeePerGas: gwei(20n), // 20 GWEI
  maxPriorityFeePerGas: DEFAULT_PRIORITY_FEE,
  baseFee: undefined
};
const PRIORITY_FEE_INCREASE_BOUNDARY = 200; // %

// Returns base fee multiplier percentage
const getBaseFeeMultiplier = (baseFee: bigint) => {
  if (baseFee <= gwei(40n)) {
    return 200n;
  } else if (baseFee <= gwei(100n)) {
    return 160n;
  } else if (baseFee <= gwei(200n)) {
    return 140n;
  } else {
    return 120n;
  }
};

const estimatePriorityFee = async (
  provider: ProviderLike,
  baseFee: bigint,
  blockNumber: bigint
) => {
  if (baseFee < PRIORITY_FEE_ESTIMATION_TRIGGER) {
    return DEFAULT_PRIORITY_FEE;
  }
  const feeHistory = await getFeeHistory(
    provider,
    hexlify(FEE_HISTORY_BLOCKS),
    hexlify(blockNumber),
    [FEE_HISTORY_PERCENTILE]
  );

  const rewards = feeHistory.reward
    ?.map((r) => BigInt(r[0]))
    .filter((r) => r > 0n)
    .sort();

  if (!rewards) {
    return null;
  }

  // Calculate percentage increases from between ordered list of fees
  const percentageIncreases = rewards.reduce((acc, cur, i, arr) => {
    if (i === arr.length - 1) {
      return acc;
    }
    const next = arr[i + 1];
    const p = ((next - cur) / cur) * 100n;
    return [...acc, p];
  }, [] as bigint[]);
  const highestIncrease = max(percentageIncreases);
  const highestIncreaseIndex = percentageIncreases.findIndex((p) => p === highestIncrease);

  // If we have big increase in value, we could be considering "outliers" in our estimate
  // Skip the low elements and take a new median
  const values =
    highestIncrease >= PRIORITY_FEE_INCREASE_BOUNDARY &&
    highestIncreaseIndex >= Math.floor(rewards.length / 2)
      ? rewards.slice(highestIncreaseIndex)
      : rewards;

  return values[Math.floor(values.length / 2)];
};

export const estimateFees = async (provider: ProviderLike): Promise<EstimationResult> => {
  try {
    const latestBlock = await getLatestBlock(provider);

    if (!latestBlock.baseFeePerGas) {
      throw new Error('An error occurred while fetching current base fee, falling back');
    }

    const baseFee = BigInt(latestBlock.baseFeePerGas);

    const blockNumber = BigInt(latestBlock.number);

    const estimatedPriorityFee = await estimatePriorityFee(provider, baseFee, blockNumber);

    if (estimatedPriorityFee === null) {
      throw new Error('An error occurred while estimating priority fee, falling back');
    }

    const maxPriorityFeePerGas = max([estimatedPriorityFee, DEFAULT_PRIORITY_FEE]);

    const multiplier = getBaseFeeMultiplier(baseFee);

    const potentialMaxFee = (baseFee * multiplier) / 100n;
    const maxFeePerGas =
      maxPriorityFeePerGas > potentialMaxFee
        ? potentialMaxFee + maxPriorityFeePerGas
        : potentialMaxFee;

    if (maxFeePerGas >= MAX_GAS_FAST || maxPriorityFeePerGas >= MAX_GAS_FAST) {
      throw new Error('Estimated gas fee was much higher than expected, erroring');
    }

    return {
      maxFeePerGas: roundToWholeGwei(maxFeePerGas),
      maxPriorityFeePerGas: roundToWholeGwei(maxPriorityFeePerGas),
      baseFee
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return FALLBACK_ESTIMATE;
  }
};

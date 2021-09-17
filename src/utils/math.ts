const GWEI = 1000000000n;

export const max = (values: bigint[]): bigint => values.reduce((a, b) => (b > a ? b : a), 0n);

export const round = (value: bigint, n: bigint): bigint =>
  (value / n + BigInt(value % n > n / 2n)) * n;

export const gwei = (n: bigint): bigint => n * GWEI;

export const roundToWholeGwei = (wei: bigint): bigint => round(wei, GWEI);

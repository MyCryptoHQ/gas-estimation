export interface FeeHistory {
  baseFeePerGas: string[];
  gasUsedRatio: number[];
  reward?: string[][];
  oldestBlock: string;
}

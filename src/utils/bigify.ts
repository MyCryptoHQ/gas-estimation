import { BigNumber as BigNumberish } from '@ethersproject/bignumber';
import BigNumber from 'bignumber.js';

export type BigifySupported = BigNumber.Value | BigNumber | BigNumberish | bigint;

export const bigify = (v: BigifySupported): BigNumber => {
  BigNumber.config({ DECIMAL_PLACES: 18, EXPONENTIAL_AT: 1e9 });
  if (BigNumberish.isBigNumber(v) && 'toHexString' in v) {
    return new BigNumber(v.toHexString());
  } else if (typeof v === 'object' && '_hex' in v) {
    return new BigNumber(v._hex);
  } else if (typeof v === 'bigint') {
    return new BigNumber(v.toString(16), 16);
  } else {
    return new BigNumber(v);
  }
};

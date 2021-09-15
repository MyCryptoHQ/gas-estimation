import { addHexPrefix } from './addHexPrefix';
import type { BigifySupported } from './bigify';
import { bigify } from './bigify';

export const hexlify = (input: BigifySupported): string => addHexPrefix(bigify(input).toString(16));

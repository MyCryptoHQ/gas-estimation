import { addHexPrefix } from './addHexPrefix';

export const hexlify = (input: number | bigint): string => addHexPrefix(input.toString(16));

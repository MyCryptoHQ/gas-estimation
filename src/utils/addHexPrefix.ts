export const addHexPrefix = (str: string): string => (str.slice(0, 2) === '0x' ? str : `0x${str}`);

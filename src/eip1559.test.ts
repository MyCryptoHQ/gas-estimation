import { estimateFees, FALLBACK_ESTIMATE } from './eip1559';

const block = {
  hash: '0x38b34c2313e148a0916406a204536c03e5bf77312c558d25d3b63d8a4e30af47',
  parentHash: '0xc33eb2f6795e58cb9ad800bfeed0463a14c8a94a9e621de14fd05a782f1ffbd4',
  number: 5219914,
  timestamp: 1627469703,
  nonce: '0x0000000000000000',
  difficulty: 1,
  gasLimit: 0x01c9c380,
  gasUsed: 0x26aee4,
  miner: '0x0000000000000000000000000000000000000000',
  extraData:
    '0xd883010a05846765746888676f312e31362e35856c696e757800000000000000a866c8e4b72c133037132849cf9419f32126bf93dfb5a42b092828fd4bfa5e8e2ce59121cb2516740c03af11225e5b6a2d9dad29cf4fe77a70af26c4ce30236601',
  transactions: [],
  baseFeePerGas: '0x2540be400'
};

const feeHistory = {
  oldestBlock: '0x4fa645',
  reward: [['0x0'], ['0x3b9aca00'], ['0x12a05f1f9'], ['0x3b9aca00'], ['0x12a05f1f9']],
  baseFeePerGas: ['0x7', '0x7', '0x7', '0x7', '0x7', '0x7'],
  gasUsedRatio: [0, 0.10772606666666666, 0.0084, 0.12964573239101315, 0.06693689580776942]
};

describe('estimateFees', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  const mockProvider = {
    send: jest.fn()
  };
  it('estimates without using priority fees', () => {
    mockProvider.send.mockResolvedValueOnce(block);
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 10000000000n,
      maxFeePerGas: 20000000000n,
      maxPriorityFeePerGas: 3000000000n
    });
  });

  it('estimates priority fees', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x174876e800' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 100000000000n,
      maxFeePerGas: 160000000000n,
      maxPriorityFeePerGas: 5000000000n
    });
  });

  it('estimates priority fees removing low outliers', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return {
          ...feeHistory,
          reward: [
            ['0x1'],
            ['0x1'],
            ['0x1'],
            ['0x1'],
            ['0x1'],
            ['0x1a13b8600'],
            ['0x12a05f1f9'],
            ['0x3b9aca00'],
            ['0x1a13b8600']
          ]
        };
      }
      return { ...block, baseFeePerGas: '0x174876e800' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 100000000000n,
      maxFeePerGas: 160000000000n,
      maxPriorityFeePerGas: 5000000000n
    });
  });

  it('uses 1.6 multiplier for base if above 40 gwei', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x11766ffa76' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 75001494134n,
      maxFeePerGas: 120000000000n,
      maxPriorityFeePerGas: 3000000000n
    });
  });

  it('uses 1.4 multiplier for base if above 100 gwei', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x2e90edd000' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 200000000000n,
      maxFeePerGas: 280000000000n,
      maxPriorityFeePerGas: 5000000000n
    });
  });

  it('uses 1.2 multiplier for base if above 200 gwei', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x45d964b800' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 300000000000n,
      maxFeePerGas: 360000000000n,
      maxPriorityFeePerGas: 5000000000n
    });
  });

  it('handles baseFee being smaller than priorityFee', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x7' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 7n,
      maxFeePerGas: 3000000000n,
      maxPriorityFeePerGas: 3000000000n
    });
  });

  it('falls back if no baseFeePerGas on block', async () => {
    mockProvider.send.mockResolvedValueOnce({ ...block, baseFeePerGas: undefined });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual(FALLBACK_ESTIMATE);
  });

  it('falls back if priority fetching fails', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return { ...feeHistory, reward: undefined };
      }
      return { ...block, baseFeePerGas: '0x45d964b800' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual({
      baseFee: 300000000000n,
      maxFeePerGas: 360000000000n,
      maxPriorityFeePerGas: FALLBACK_ESTIMATE.maxPriorityFeePerGas
    });
  });

  it('falls back if gas is VERY high', async () => {
    mockProvider.send.mockImplementation((method) => {
      if (method === 'eth_feeHistory') {
        return feeHistory;
      }
      return { ...block, baseFeePerGas: '0x91812d7d600' };
    });
    return expect(estimateFees(mockProvider)).resolves.toStrictEqual(FALLBACK_ESTIMATE);
  });
});

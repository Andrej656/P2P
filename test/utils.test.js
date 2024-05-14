const bitcoin = require('bitcoinjs-lib');
const request = require('request');
const utils = require('./utils');

// Mocking the request library
jest.mock('request');

const network = bitcoin.networks.testnet;

describe('Utility Functions', () => {
    describe('fundAddress()', () => {
        it('should fund the address with some testnet bitcoins', (done) => {
            const address = 'mzAybjHVUd9UGZD9AmZJ6U8U8JfwtXsnbF';
            const expectedRequestBody = { 'address': address };

            request.mockImplementation((options, callback) => {
                expect(options.method).toBe('POST');
                expect(options.url).toBe('https://testnet-faucet.mempool.co/faucet');
                expect(options.json).toEqual(expectedRequestBody);

                callback(null, null, { status: 'success' });
            });

            utils.fundAddress(address, () => {
                done();
            });
        });
    });

    describe('createLendingTransaction()', () => {
        it('should create a lending transaction', () => {
            const lenderKeyPair = bitcoin.ECPair.makeRandom({ network });
            const borrowerAddress = 'n3p1T2CoT3MRFpQBNu88NbtxfsE9KFTXsW';
            const amount = 0.1e8;
            const interestRate = 5;
            const repaymentTerm = 30;

            const mockTransaction = {
                toHex: jest.fn(() => 'rawTx')
            };

            const mockTxb = {
                addInput: jest.fn(),
                addOutput: jest.fn(),
                sign: jest.fn(),
                build: jest.fn(() => mockTransaction)
            };

            bitcoin.TransactionBuilder = jest.fn(() => mockTxb);

            const expectedMetadata = {
                interestRate: interestRate,
                repaymentTerm: repaymentTerm,
                timestamp: expect.any(Number)
            };

            const expectedMetadataScript = bitcoin.script.nullData.output.encode(Buffer.from(JSON.stringify(expectedMetadata)));

            utils.createLendingTransaction(lenderKeyPair, borrowerAddress, amount, interestRate, repaymentTerm, (rawTx) => {
                expect(rawTx).toBe('rawTx');

                expect(mockTxb.addInput).toHaveBeenCalledWith('previousTxHash', 0);
                expect(mockTxb.addOutput).toHaveBeenCalledWith(borrowerAddress, amount);
                expect(mockTxb.addOutput).toHaveBeenCalledWith(expectedMetadataScript, 0);
                expect(mockTxb.sign).toHaveBeenCalledWith(0, lenderKeyPair);
                expect(mockTransaction.toHex).toHaveBeenCalled();
            });
        });
    });

    describe('broadcastTransaction()', () => {
        it('should broadcast the transaction to the Bitcoin network', (done) => {
            const rawTx = 'rawTx';

            request.mockImplementation((options, callback) => {
                expect(options.method).toBe('POST');
                expect(options.url).toBe('https://api.blockcypher.com/v1/btc/test3/txs/push');
                expect(options.json).toEqual({ 'tx': rawTx });

                callback(null, null, { status: 'success' });
            });

            utils.broadcastTransaction(rawTx);

            done();
        });
    });
});

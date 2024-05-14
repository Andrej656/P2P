const bitcoin = require('bitcoinjs-lib');
const utils = require('../src/utils');
const lending = require('../src/lending');

jest.mock('request');

describe('Lending Module', () => {
    describe('initiateLending()', () => {
        it('should fund the lender address and create a lending transaction', (done) => {
            const lenderKeyPair = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.testnet });
            const lenderAddress = bitcoin.payments.p2pkh({ pubkey: lenderKeyPair.publicKey, network: bitcoin.networks.testnet }).address;

            const mockFundAddress = jest.spyOn(utils, 'fundAddress');
            const mockCreateLendingTransaction = jest.spyOn(utils, 'createLendingTransaction');
            const mockBroadcastTransaction = jest.spyOn(utils, 'broadcastTransaction');

            mockFundAddress.mockImplementation((address, callback) => {
                callback();
            });

            mockCreateLendingTransaction.mockImplementation((lenderKeyPair, borrowerAddress, amount, interestRate, repaymentTerm, callback) => {
                callback('rawTx');
            });

            lending.initiateLending();

            expect(mockFundAddress).toHaveBeenCalledWith(lenderAddress, expect.any(Function));
            expect(mockCreateLendingTransaction).toHaveBeenCalledWith(lenderKeyPair, expect.any(String), 0.1e8, 5, 30, expect.any(Function));
            expect(mockBroadcastTransaction).toHaveBeenCalledWith('rawTx');

            done();
        });
    });
});

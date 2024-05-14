const bitcoin = require('bitcoinjs-lib');
const borrowing = require('../src/borrowing');

describe('Borrowing Module', () => {
    describe('initiateBorrowing()', () => {
        it('should generate a borrower address', () => {
            const borrowerKeyPair = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.testnet });
            const borrowerAddress = bitcoin.payments.p2pkh({ pubkey: borrowerKeyPair.publicKey, network: bitcoin.networks.testnet }).address;

            const logSpy = jest.spyOn(console, 'log');

            borrowing.initiateBorrowing();

            expect(logSpy).toHaveBeenCalledWith('Borrower Address:', borrowerAddress);
        });
    });
});

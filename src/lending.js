const bitcoin = require('bitcoinjs-lib');
const utils = require('./utils');

const network = bitcoin.networks.testnet;

function initiateLending() {
    const lenderKeyPair = bitcoin.ECPair.makeRandom({ network });
    const lenderAddress = bitcoin.payments.p2pkh({ pubkey: lenderKeyPair.publicKey, network }).address;

    // Fund the lender address with some testnet bitcoins
    utils.fundAddress(lenderAddress, () => {
        // Create a lending transaction
        const borrowerAddress = 'n3p1T2CoT3MRFpQBNu88NbtxfsE9KFTXsW'; // Replace with borrower's address
        const amount = 0.1e8;
        const interestRate = 5; // Example interest rate (in percent)
        const repaymentTerm = 30; // Example repayment term (in days)

        utils.createLendingTransaction(lenderKeyPair, borrowerAddress, amount, interestRate, repaymentTerm, (rawTx) => {
            // Broadcast the transaction to the Bitcoin network
            utils.broadcastTransaction(rawTx);
        });
    });
}

module.exports = { initiateLending };

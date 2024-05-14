const bitcoin = require('bitcoinjs-lib');
const utils = require('./utils');

const network = bitcoin.networks.testnet;

function initiateBorrowing() {
    const borrowerKeyPair = bitcoin.ECPair.makeRandom({ network });
    const borrowerAddress = bitcoin.payments.p2pkh({ pubkey: borrowerKeyPair.publicKey, network }).address;

    // Log borrower address
    console.log("Borrower Address:", borrowerAddress);
}

module.exports = { initiateBorrowing };

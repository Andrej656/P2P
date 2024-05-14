const bitcoin = require('bitcoinjs-lib');
const request = require('request');

// Bitcoin network configuration
const network = bitcoin.networks.testnet; // We'll use Bitcoin's testnet for testing

// Generate a new Bitcoin address for the lender
const lenderKeyPair = bitcoin.ECPair.makeRandom({ network });
const lenderAddress = bitcoin.payments.p2pkh({ pubkey: lenderKeyPair.publicKey, network }).address;

// Function to fund the lending address with some testnet bitcoins
function fundAddress(address, callback) {
    request({
        url: 'https://testnet-faucet.mempool.co/faucet',
        method: 'POST',
        json: { 'address': address }
    }, function (error, response, body) {
        if (error) {
            console.error('Error funding address:', error);
            return;
        }
        console.log('Funded address:', address);
        callback();
    });
}

// Generate a new Bitcoin address for the borrower
const borrowerKeyPair = bitcoin.ECPair.makeRandom({ network });
const borrowerAddress = bitcoin.payments.p2pkh({ pubkey: borrowerKeyPair.publicKey, network }).address;

// Function to create a lending transaction
function createLendingTransaction(lenderAddress, borrowerAddress, amount, interestRate, repaymentTerm, callback) {
    const txb = new bitcoin.TransactionBuilder(network);

    txb.addInput('previousTxHash', 0); // Replace 'previousTxHash' with the actual transaction hash
    txb.addOutput(borrowerAddress, amount); // Lender sends bitcoins to borrower

    // Add metadata to the transaction
    const metadata = {
        interestRate: interestRate,
        repaymentTerm: repaymentTerm,
        timestamp: Math.floor(Date.now() / 1000)
    };

    const metadataScript = bitcoin.script.nullData.output.encode(Buffer.from(JSON.stringify(metadata)));
    txb.addOutput(metadataScript, 0);

    // Sign the transaction with lender's private key
    txb.sign(0, lenderKeyPair);

    const rawTx = txb.build().toHex();
    console.log('Lending transaction:', rawTx);
    callback(rawTx);
}

// Function to broadcast the transaction to the Bitcoin network
function broadcastTransaction(rawTx) {
    request({
        url: 'https://api.blockcypher.com/v1/btc/test3/txs/push',
        method: 'POST',
        json: { 'tx': rawTx }
    }, function (error, response, body) {
        if (error) {
            console.error('Error broadcasting transaction:', error);
            return;
        }
        console.log('Transaction broadcasted to the network:', body);
    });
}

// Fund the lender address with some testnet bitcoins
fundAddress(lenderAddress, function () {
    // Create a lending transaction
    createLendingTransaction(lenderAddress, borrowerAddress, 0.1e8, 5, 30, function (rawTx) {
        // Broadcast the transaction to the Bitcoin network
        broadcastTransaction(rawTx);
    });
});

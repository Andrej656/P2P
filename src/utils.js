const bitcoin = require('bitcoinjs-lib');
const request = require('request');

const network = bitcoin.networks.testnet;

function fundAddress(address, callback) {
    // Function to fund the lending address with some testnet bitcoins
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

function createLendingTransaction(lenderKeyPair, borrowerAddress, amount, interestRate, repaymentTerm, callback) {
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

function broadcastTransaction(rawTx) {
    // Function to broadcast the transaction to the Bitcoin network
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

module.exports = { fundAddress, createLendingTransaction, broadcastTransaction };

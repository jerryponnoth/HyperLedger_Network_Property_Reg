'use strict';

/**
 * This is a Node.JS application to create purchase order (PO) on the network.
 */

// const fs = require('fs');
// const yaml = require('js-yaml');
// const { FileSystemWallet, Gateway } = require('fabric-network');
// let gateway;
const helper = require('./contractHelper');

async function main(buyerCRN, sellerCRN, drugName, quantity) {

	try {

		const pharmanetContract = await helper.getContractInstance();

		// Create a new student account
		console.log('.....Create Purchase Order');
		const responseBuffer = await pharmanetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing Purchase Order Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Purchase Order Transaction Complete!');
		return response;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {

		// Disconnect from the fabric gateway
		// console.log('.....Disconnecting from Fabric Gateway');
		helper.disconnect();

	}
}

// main("WALMART001", "WAL001","Mortrin 200","1").then(() => {
// 	console.log('Purchase Order created');
// });

module.exports.execute = main;

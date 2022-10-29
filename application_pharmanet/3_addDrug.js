'use strict';

/**
 * This is a Node.JS application to add a new drug on the network.
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN, mspId) {

	try {

		const pharmanetContract = await helper.getContractInstance(mspId);

		// Create a new drug
		console.log('.....Add a new drug');
		const responseBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);
		console.log('.....Processing Add new drug Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Add new drug Transaction Complete!');
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

// main("Mortrin 200","MOR001","10/22/2022","10/22/2024","CVS002").then(() => {
// 	console.log('A new drug added');
// });

module.exports.execute = main;

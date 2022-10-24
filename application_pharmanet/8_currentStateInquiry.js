'use strict';

/**
 * This is a Node.JS application to view state of a drug on the network.
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo) {

	try {

		const pharmanetContract = await helper.getContractInstance();

		// Create a new student account
		console.log('.....View Drug Current State');
		const responseBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		// process response
		console.log('.....Processing View Drug Current State Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....View Drug Current State Transaction Complete!');
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
// main("Mortrin 200", "MOR001").then(() => {
// 	console.log('Drug current state displayed');
// });

module.exports.execute = main;

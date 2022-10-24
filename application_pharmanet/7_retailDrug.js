'use strict';

/**
 * This is a Node.JS application to retail a drug on the network.
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo, retailerCRN, customerAadhar, organisationType) {

	try {

		const pharmanetContract = await helper.getContractInstance();

		// Retail drug; drug sell by retailer to customer
		console.log('.....Retail drug');
		const responseBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		console.log('.....Processing Retail drug Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Retail drug Transaction Complete!');
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
// main("Mortrin 200", "MOR001", "WALMART001", "ADH-1111").then(() => {
// 	console.log('Drug sell by retailer to customer ');
// });

module.exports.execute = main;

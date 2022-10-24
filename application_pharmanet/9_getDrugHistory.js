'use strict';

/**
 * This is a Node.JS application to view drug history on the network.
 */

const helper = require('./contractHelper');

async function main(drugName, serialNo) {

	try {

		const pharmanetContract = await helper.getContractInstance();

		// View drug history
		console.log('.....View Drug History');
		const responseBuffer = await pharmanetContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Processing View Drug History Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....View Drug History Transaction Complete!');
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
// 	console.log('Drug history displayed');
// });

module.exports.execute = main;

'use strict';

/**
 * This is a Node.JS application to create shipment on the network.
 */

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, listOfAssets, transporterCRN, mspId) {

	try {

		const pharmanetContract = await helper.getContractInstance(mspId);
    const assetList = JSON.stringify(listOfAssets);
		console.log(buyerCRN,drugName,listOfAssets,transporterCRN,mspId)
		// Create shipment
		console.log('.....Create Shipment');
		const responseBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, assetList, transporterCRN);

		// process response
		console.log('.....Processing Create Shipment Transaction Response \n\n');
		let response = JSON.parse(responseBuffer.toString());
		console.log(response);
		console.log('\n\n.....Create Shipment Transaction Complete!');
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

// const drugAsset = {"assets":["MOR001"]}
//  main("WALMART001","Mortrin 200",drugAsset,"TPRO001").then(() => {
// 	console.log('Shipment created');
// });


module.exports.execute = main;

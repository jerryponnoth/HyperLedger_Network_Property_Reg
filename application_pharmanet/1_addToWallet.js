'use strict';


const fs = require('fs'); // FileSystem Library
const {Wallets} = require('fabric-network');

async function main(certificatePath, keyFilePath, mspId) {

	// Main try/catch block
	try {

    const wallet = await Wallets.newFileSystemWallet('./identity/' + mspId);

		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		// IMPORTANT: Change the private key name to the key generated on your computer
		const privateKey = fs.readFileSync(keyFilePath).toString();

    const identity = {
      credentials:  {
        certificate:  certificate,
        privateKey: privateKey
      },
      mspId: mspId,
      type: 'X.509'
    };

    await wallet.put('ADMIN_'+ mspId, identity);
    console.log(`Successfully addded Identity ${mspId} to the wallet`);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		throw new Error(error);
	}
}

// const certPath = '/home/upgrad/certification-network/test-network0/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org2.example.com-cert.pem';
// const keyFilePath = '/home/upgrad/certification-network/test-network0/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/priv_sk';
// main(certPath,keyFilePath);
module.exports.execute = main;

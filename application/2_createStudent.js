'use strict'

const fs = require('fs');
const {Wallets, Gateway} = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function getContractInstance() {
  gateway = new Gateway();
  const connectionprofile  = yaml.load(fs.readFileSync('./connection-org1.yaml','utf8'));
  const wallet = await Wallets.newFileSystemWallet('./identity/org1');
  const gatewayoptions = {
    wallet: wallet,
    identity: 'ADMIN_ORG1',
    discovery:  {enabled: true, asLocalhost:  true}
  }
  await gateway.connect(connectionprofile,gatewayoptions);

  const channel = await gateway.getNetwork('mychannel');
  return channel.getContract('certnet','org.certification-network.certnet');
}

async function main(studentId,name,email) {
  try {
  const contract  = await getContractInstance();
  const respBuffer = await contract.submitTransaction('createStudent',studentId,name,email);
  const student = JSON.parse(respBuffer.toString());
  console.log(student);
  return student;
}
catch(e) {
  console.log(e);

}
finally {
  gateway.disconnect();
}

}

// main('0012','JE','JE@cop.com');
module.exports.execute = main;

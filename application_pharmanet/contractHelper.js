'use strict'

const fs = require('fs');
const {Wallets, Gateway} = require('fabric-network');
const yaml = require('js-yaml');
let gateway;

async function getContractInstance(mspId) {
  gateway = new Gateway();
  const connectionprofile  = yaml.load(fs.readFileSync('./connection_profiles/' + mspId + '.yaml','utf8'));
  const wallet = await Wallets.newFileSystemWallet('./identity/'+ mspId);
  const gatewayoptions = {
    wallet: wallet,
    identity: 'ADMIN_'+ mspId,
    discovery:  {enabled: true, asLocalhost:  true}
  }
  await gateway.connect(connectionprofile,gatewayoptions);

  const channel = await gateway.getNetwork('pharmachannel');
  return channel.getContract('pharmanet','PharmaContract');
}

function disconnect()
{
  gateway.disconnect();
}

module.exports.getContractInstance = getContractInstance
module.exports.disconnect = disconnect

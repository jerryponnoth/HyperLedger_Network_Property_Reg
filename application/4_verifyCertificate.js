'use strict'

const helper = require('./contractHelper.js');

async function main(studentId,courseId,hash) {
  try {
  const contract = await helper.getContractInstance();
  const listner = async (event) => {
    if(event.eventName === 'verifyCertificate'){
      const payload = JSON.parse(event.payload.toString());
      console.log(payload);
    }
  }
  await contract.addContractListener(listner)
  const respBuffer = await contract.submitTransaction('verifyCertificate',studentId,courseId,hash);
  const certificate = JSON.parse(respBuffer.toString());
  console.log(certificate);
}
catch (e) {
  console.log(e);
}

finally{
  helper.disconnect();
}

}

// main('0012','CR01','HAS2H1');
module.exports.execute = main;

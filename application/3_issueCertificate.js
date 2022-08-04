'use strict'

const helper = require('./contractHelper.js');

async function main(studentId,courseId,grade,hash) {
  try {
  const contract = await helper.getContractInstance();
  const respBuffer = await contract.submitTransaction('issueCertificate',studentId,courseId,grade,hash);
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

// main('0012','CR01','A','HASH1');
module.exports.execute = main;

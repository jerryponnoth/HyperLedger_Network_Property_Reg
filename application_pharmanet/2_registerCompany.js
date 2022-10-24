'use strict'

const fs = require('fs');
const helper = require('./contractHelper.js');




async function main(companyCRN,companyName,location,organizationRole) {
  const loc = JSON.stringify(location);
  try {
  const contract = await helper.getContractInstance();
  const respBuffer = await contract.submitTransaction('registerCompany',companyCRN,companyName,loc,organizationRole);
  const company = JSON.parse(respBuffer.toString());
  console.log(company);
  return company;
}
catch(e) {
  console.log(e);

}
finally {
  helper.disconnect();
}

}

// const addressVar = {
//   "address":{"Street":"5000ABCWay","City":"Denton","State":"TX","Zip":75078}}
//
// main("CVS002","CVS Chicago",addressVar,"Manufacturer");
module.exports.execute = main;

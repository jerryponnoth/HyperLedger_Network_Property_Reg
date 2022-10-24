'use strict';

const ROLES = require('./config.js').OrganizationRoles;
const NS = require('./config.js').Namespaces;
const HIERARCHY = require('./config.js').HierarchyKey;

const namesSpace =
{
	COMPANY: 'org.pharma-network.pharmanet.company',
	MANUFACTURER: 'org.pharma-network.pharmanet.manufacturer',
	DISTRIBUTOR: 'org.pharma-network.pharmanet.distributor',
	RETAILER: 'org.pharma-network.pharmanet.retailer',
	CONSUMER: 'org.pharma-network.pharmanet.consumer',
	TRANSPORTER: 'org.pharma-network.pharmanet.transporter',
	DRUG: 'org.pharma-network.pharmanet.drug',
	DRUG_PO: 'org.pharma-network.pharmanet.drug.po',
	DRUG_SHIPMENT: 'org.pharma-network.pharmanet.drug.shipment'
};

class validator
{
    /**
     * This function is called by the transactions defined inside the smart contract to validate the initiator of the transaction
     * @param {*} ctx The transaction context
     * @param {*} initiator This variable is used to store the organisation name of the initiating peer
     */

	static validateInitiator(ctx, initiator)
	{
    const initiatorMSP = ctx.clientIdentity.getMSPID();
    console.log(initiatorMSP);
    if(initiatorMSP===initiator){
    return true;}
    else{
    return false;}
  }

	static async storeAsset(ctx, key, object) {
		let dataBuffer = Buffer.from(JSON.stringify(object));
		return await ctx.stub.putState(key, dataBuffer);
    }

	static	async createCompanyKey(ctx, companyCRN, companyName) {
			return await ctx.stub.createCompositeKey(
				namesSpace['COMPANY'], [companyCRN, companyName]
			);
		}

	static	async getAsset(ctx, key) {
				let assetBuffer = await ctx.stub
					.getState(key)
					.catch(err => console.log(err));

				if (assetBuffer.length === 0) {
					return false;
				}

				let assetObject = JSON.parse(assetBuffer.toString());

				return assetObject;
			}

		static	async createDrugKey(ctx, drugName, serialNo) {
	 return await ctx.stub.createCompositeKey(
		 namesSpace['DRUG'], [drugName, serialNo]
	 );
	 }

	static async createDrugPOKey(ctx, buyerCRN, drugName) {
	 		return await ctx.stub.createCompositeKey(
	 			namesSpace['DRUG_PO'], [buyerCRN, drugName]
	 		);
	 	}

	static	async createDrugShipmentKey(ctx, buyerCRN, drugName) {
	return await ctx.stub.createCompositeKey(
			namesSpace['DRUG_SHIPMENT'], [buyerCRN, drugName]
	);
	}


	static async getCompanyKeyByCRN(ctx, companyCRN){
	let companyList = await ctx.stub
		.getStateByPartialCompositeKey(namesSpace['COMPANY'], [companyCRN])
		.catch(err => console.log(err));

	let companyKey = null;
	let companyObj;
	while (true) {
		companyObj = await companyList.next();
		if (companyObj.value) {
			companyKey = companyObj.value.key;
		} else {
			companyKey = false;
		}
		companyList.close();
		break;
	}
	return companyKey;
	}

	static async getCompanyObjectByCRN(ctx, companyCRN){
	 let companyList = await ctx.stub
		 .getStateByPartialCompositeKey(namesSpace['COMPANY'], [companyCRN])
		 .catch(err => console.log(err));

	 let companyJSON = null;
	 let companyObj;
	 while (true) {
		 companyObj = await companyList.next();
		 if (companyObj.value) {
			 companyJSON = JSON.parse(companyObj.value.value.toString('utf8'));//.toString());
		 } else {
			 companyJSON = false;
		 }
		 companyList.close();
		 break;
	 }
	 return companyJSON;
	 }

	static async getDrugHistory(ctx, key){
	let historyList = await ctx.stub
		.getHistoryForKey(key)
		.catch(err => console.log(err));

	// console.log(historyList);

	let history = [];
	while(true) {
		let res = await historyList.next();
		// console.log(Buffer.from(res.value.value));
		if (!res.done) {
			let obj = {};

			obj.tx_id = res.value.tx_id;
			obj.timestamp = res.value.timestamp;
			// obj.is_delete = res.value.is_delete.toString('utf8');
			obj.asset = JSON.parse(Buffer.from(res.value.value).toString('utf-8'))

			history.push(obj);
		}

		if (res.done) {
			console.log('end of data');
			await historyList.close();
			return history;
		}
	}
}

}

module.exports=validator;

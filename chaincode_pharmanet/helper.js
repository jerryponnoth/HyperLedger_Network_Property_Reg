'use strict';

/**
 * Common functions
 */

const ClientIdentity = require('fabric-shim').ClientIdentity;
const ROLES = require('./config.js').OrganizationRoles;
const NS = require('./config.js').Namespaces;
const HIERARCHY = require('./config.js').HierarchyKey;

const Helper = {
	/**
	 * Create composite key for company
	 * @param  ctx
	 * @param  companyCRN
	 * @param  companyName
	 * @returns
	 */
	async createCompanyKey(ctx, companyCRN, companyName) {
		return await ctx.stub.createCompositeKey(
			NS.COMPANY, [companyCRN, companyName]
		);
	},

	/**
	 * Get existing object by composite key
	 * @param  ctx
	 * @param  key
	 * @returns
	 */
	async getAsset(ctx, key) {
		let assetBuffer = await ctx.stub
			.getState(key)
			.catch(err => console.log(err));

		if (assetBuffer.length === 0) {
			return false;
		}

		let assetObject = JSON.parse(assetBuffer.toString());

		return assetObject;
	},

	/**
	 * Store Asset with key
	 * @param  ctx
	 * @param  key
	 * @param  object
	 * @returns
	 */
	async storeAsset(ctx, key, object) {
		let dataBuffer = Buffer.from(JSON.stringify(object));
		return await ctx.stub.putState(key, dataBuffer);
    },

	/**
	 * Validate Organization Role
	 * @param  role
	 * @returns
	 */
	validateOrganizationRole(organizationRole) {
		if (ROLES.indexOf(organizationRole) === -1) {
			throw new Error('Invalid organisation role.');
		}
    },

    /**
     * Get Hierarchy Key
     * @param  role
     * @returns
     */
    getHierarchyKey(organizationRole) {
		return HIERARCHY[organizationRole] || null;
    },

    /**
     * Verify organization type
     *
     * @param  ctx
     * @param  organizationType
     * @returns
     */
    assertOrganization(ctx, organizationType) {
		let creator = ctx.stub.getCreator();
		if (creator.mspid !== organizationType) {
			throw new Error('Organisation not authorized to execute this command.');
		}
		return true;
    },

    /**
	 * Create composite key for drug
	 * @param  ctx
	 * @param  drugName
	 * @param  serialNo
	 * @returns
	 */
    async createDrugKey(ctx, drugName, serialNo) {
		return await ctx.stub.createCompositeKey(
			NS.DRUG, [drugName, serialNo]
		);
    },

    /**
     * Get company key by Company CRN
     *
     * @param ctx
     * @param companyCRN
     * @returns
     */
    async getCompanyKeyByCRN(ctx, companyCRN){
		let companyList = await ctx.stub
			.getStateByPartialCompositeKey(NS.COMPANY, [companyCRN])
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
    },

    /**
     * Get company object by Company CRN
     *
     * @param ctx
     * @param companyCRN
     * @returns
     */
    async getCompanyObjectByCRN(ctx, companyCRN){
		let companyList = await ctx.stub
			.getStateByPartialCompositeKey(NS.COMPANY, [companyCRN])
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
    },

    /**
	 * Create composite key for drug PO
	 * @param  ctx
	 * @param  buyerCRN
	 * @param  drugName
	 * @returns
	 */
	async createDrugPOKey(ctx, buyerCRN, drugName) {
		return await ctx.stub.createCompositeKey(
			NS.DRUG_PO, [buyerCRN, drugName]
		);
	},

	/**
	 * Get identity
	 * @param ctx
	 * @returns
	 */
	getIdentity(ctx) {
		let cid = new ClientIdentity(ctx.stub);
		return cid.getID();
    }

    /**
	 * Create composite key for drug Shipment
	 * @param  ctx
	 * @param  buyerCRN
	 * @param  drugName
	 * @returns
	 */
    async createDrugShipmentKey(ctx, buyerCRN, drugName) {
		return await ctx.stub.createCompositeKey(
			NS.DRUG_SHIPMENT, [buyerCRN, drugName]
		);
    },

	async getDrugHistory(ctx, key){
		let historyList = await ctx.stub
			.getHistoryForKey(key)
			.catch(err => console.log(err));

		let history = [];
		while(true) {
			let res = await historyList.next();
			if (res.value && res.value.value.toString()) {
				let obj = {};

				obj.tx_id = res.value.tx_id;
				obj.timestamp = res.value.timestamp;
				obj.is_delete = res.value.is_delete.toString('utf8');
				obj.asset = JSON.parse(res.value.value.toString('utf8'));

				history.push(obj);
			}

			if (res.done) {
				console.log('end of data');
				await historyList.close();
				return history;
			}
		}
	},
}

module.exports = Helper;

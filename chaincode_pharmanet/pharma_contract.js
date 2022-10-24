'use strict';

const {Contract} = require('fabric-contract-api');
const validator = require('./validator');

const roleObject =
{
	'Manufacturer':  1,
	'Distributor': 2,
	'Retailer': 3,
	'Transporter': null
};

class PharmaContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('PharmaContract');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('PharmaContract-PharmaContract Smart Contract Instantiated');
    }

		async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
			// Create a new composite key for the new company account
			const companyKey = await validator.createCompanyKey(ctx, companyCRN, companyName);

			// Fetch company with given ID from blockchain
			let existingCompany = await validator.getAsset(ctx, companyKey);

			let heirarchy = roleObject[organisationRole];

			if (heirarchy === undefined)
			{
				throw new Error('role is not registered.');

			}


			if (existingCompany !== false) {
				throw new Error('Company is already registered.');
			} else {

				// Create a company object to be stored in blockchain
				let companyObject = {
					companyID: companyKey,
		            name: companyName,
		            location: location,
		            organisationRole: organisationRole,
		            hierarchyKey:heirarchy
				};
				await validator.storeAsset(ctx, companyKey, companyObject);

	        	return companyObject;
			}
		}

		async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
				// validator.assertOrganization(ctx, 'manufacturerMSP');

				// Create a new composite key for the new drug
		        const drugKey = await validator.createDrugKey(ctx, drugName, serialNo);

		        // Fetch drug with given ID from blockchain
		        let existingDrug = await validator.getAsset(ctx, drugKey);
		        if (existingDrug !== false) {
		            throw new Error('Drug is already added.');
		        } else {
			        let companyKey = await validator.getCompanyKeyByCRN(ctx, companyCRN);
			        if (companyKey === false) {
			            throw new Error('Company is not registered.');
			        }

			        let drugObject = {
			            productID: drugKey,
			            name: drugName,
			            manufacturer: companyKey,
			            manufacturingDate: mfgDate,
			            expiryDate: expDate,
			            owner: companyKey,
			            shipment: null,
			        }
			        await validator.storeAsset(ctx, drugKey, drugObject);

			        return drugObject;
			    }
			}

			/**
			 * Create a Purchase Order (PO)
			 *
			 * To buy drugs, by companies belonging to Distributor or Retailer
			 *
			 * @param ctx       The transaction context object
			 * @param buyerCRN  Buyer CRN
			 * @param sellerCRN Seller CRN
			 * @param drugName  Name of the Drug for which PO raised
			 * @param quantity  Number of units required
			 * @returns
			 */
			async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
				let buyerObject = await validator.getCompanyObjectByCRN(ctx, buyerCRN);
		        if (buyerObject === false) {
		            throw new Error('Buyer is not registered.');
		        }

		        let sellerObject = await validator.getCompanyObjectByCRN(ctx, sellerCRN);
		        if (sellerObject === false) {
		            throw new Error('Seller is not registered.');
		        }

		        let buyerHierarchyKey = parseInt(buyerObject.hierarchyKey, 10);
		        let sellerHierarchyKey = parseInt(sellerObject.hierarchyKey, 10);

		        if (buyerHierarchyKey - sellerHierarchyKey !== 1) {
		            throw new Error('Transfer of drug is not in a hierarchical manner.')
		        }

		        const drugPOKey = await validator.createDrugPOKey(ctx, buyerCRN, drugName);
		        let POObject = {
		            poID: drugPOKey,
		            drugName: drugName,
		            quantity: quantity,
		            buyer: buyerObject.companyID,
		            seller: sellerObject.companyID
		        }

		        await validator.storeAsset(ctx, drugPOKey, POObject);

		        return POObject;
			}

			/**
			 * Create Shipment by manufacturer/distributor
			 *
			 * After the buyer invokes the createPO transaction,
			 * the seller invokes this transaction to transport
			 * the consignment via a transporter corresponding to each PO.
			 *
			 * @param ctx            The transaction context object
			 * @param buyerCRN       Buyer CRN
			 * @param drugName       Name of the drug
			 * @param listOfAssets   List of assets
			 * @param transporterCRN Transporter CRN
			 * @returns
			 */
			async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
				let buyerObject = await validator.getCompanyObjectByCRN(ctx, buyerCRN);
				console.log(listOfAssets);
		        if (buyerObject === false) {
		            throw new Error('Buyer is not registered.');
		        }

		        let transporterObject = await validator.getCompanyObjectByCRN(ctx, transporterCRN);
		        if (transporterObject === false) {
		            throw new Error('Transporter is not registered.');
		        }

		        let drugPOKey = await validator.createDrugPOKey(ctx, buyerCRN, drugName);
		        let drugPOObject = await validator.getAsset(ctx, drugPOKey);
		        if (drugPOObject === false) {
		            throw new Error('Purchase Order not found.');
		        }
		        // check quantity in PO and list of assets
		        let quantity = parseInt(drugPOObject.quantity, 10);
		        let assets = JSON.parse(listOfAssets).assets;
		        if (assets.length !== quantity) {
		            throw new Error('Mismatch in quantity with PO and assets.');
		        }

		        // check if item in list of assets are valid registered IDs
		        let drugObject;
		        let drugObjects = {};
		        let drugKeys = [];
		        for (let drugSerial of assets) {
		            let drugKey = await validator.createDrugKey(ctx, drugName, drugSerial);
		            drugObject = await validator.getAsset(ctx, drugKey);
		            if (drugObject === false) {
		                throw new Error(drugSerial + ' is not a valid asset.');
		            }
		            drugObjects[drugKey] = drugObject;
		            drugKeys.push(drugKey);
		        }

		        // Create Shipment
		        // const IDENTITY = validator.getIdentity(ctx);
		        const shipmentKey = await validator.createDrugShipmentKey(ctx, buyerCRN, drugName);
		        let shipmentObject = {
		            shipmentID: shipmentKey,
		            creator: "ORG",
		            assets: drugKeys,
		            transporter: transporterObject.companyID,
		            status: "in-transit"
		        }
		        await validator.storeAsset(ctx, shipmentKey, shipmentObject);

		        // update owner of items in batch
		        for (let drugKey in drugObjects) {
		            drugObject = drugObjects[drugKey];
		            drugObject.owner = transporterObject.companyID;
		            await validator.storeAsset(ctx, drugKey, drugObject);
		        }

		        return shipmentObject;
			}

			/**
			 * Update shipment by transporter
			 *
			 * This transaction is used to update the status of the shipment
			 * to Delivered when the consignment gets delivered to the destination.
			 *
			 * @param ctx            The transaction context object
			 * @param buyerCRN       Buyer CRN
			 * @param drugName       Name of the drug
			 * @param transporterCRN Transporter CRN
			 * @returns
			 */
			async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
				// validator.assertOrganization(ctx, 'transporterMSP');

		        let transporterObject = await validator.getCompanyObjectByCRN(ctx, transporterCRN);
		        if (transporterObject === false) {
		            throw new Error('Transporter is not registered.');
		        }

		        let buyerObj = await validator.getCompanyObjectByCRN(ctx, buyerCRN);
		        if (buyerObj === false) {
		            throw new Error('Buyer is not registered.');
		        }

		        let shipmentKey = await validator.createDrugShipmentKey(ctx, buyerCRN, drugName);
		        let shipmentObject = await validator.getAsset(ctx, shipmentKey);
		        if (shipmentObject === false) {
		            throw new Error('Shipment not found.');
		        }

		        if (shipmentObject.status !== 'in-transit') {
		            throw new Error('Shipment is not in-transit..!');
		        }

		        if (transporterObject.companyID !== shipmentObject.transporter) {
		            throw new Error('Transporter mismatch with shipment.');
		        }

		        // update status of shipment
		        shipmentObject.status = 'delivered';
		        await validator.storeAsset(ctx, shipmentKey, shipmentObject);

		        // Update owner and shipment details of assets
		        let assets = shipmentObject.assets;
		        let drugObject;
		        for (let drugKey of assets) {
		            drugObject = await validator.getAsset(ctx, drugKey);
		            drugObject.owner = buyerObj.companyID;
		            if (drugObject.shipment === null) {
		                drugObject.shipment = [];
		                drugObject.shipment.push(shipmentKey);
		            } else {
		                drugObject.shipment.push(shipmentKey);
		            }
		            await validator.storeAsset(ctx, drugKey, drugObject);
		        }

		        return shipmentObject;
			}

			/**
			//  * Retail Drug by retailer to consumer
			//  *
			//  * This transaction is called by the retailer
			//  * while selling the drug to a consumer.
			//  *
			//  * @param ctx            The transaction context object
			//  * @param drugName       Name of the drug
			//  * @param serialNo       Serial number of the drug
			//  * @param retailerCRN    Retailer CRN
			//  * @param customerAadhar Customer aadhar number
			//  * @returns
			//  */
			async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
		        // validator.assertOrg(ctx, 'retailerMSP');

		        let drugKey = await validator.createDrugKey(ctx, drugName, serialNo);
		        let drugObject = await validator.getAsset(ctx, drugKey);
		        if (drugObject === false) {
		            throw new Error('Drug is not registered.');
		        }

		        let retailerObject = await validator.getCompanyObjectByCRN(ctx, retailerCRN);
		        if (retailerObject === false) {
		            throw new Error('Retailer is not registered.');
		        }

		        let retailerHierarchyKey = parseInt(retailerObject.hierarchyKey, 10);
		        if (retailerHierarchyKey !== roleObject['Retailer']) {
		            throw new Error('Only Retailer can sell drug to customer.');
		        }

		        if (drugObject.owner !== retailerObject.companyID) {
		            throw new Error('You must be owner of drug to sell.');
		        }

		        if (customerAadhar.length == 0) {
		            throw new Error('Customer Aadhar is not valid.');
		        }

		        // update drug ownership
		        drugObject.owner = customerAadhar;
		        await validator.storeAsset(ctx, drugKey, drugObject);

		        return drugObject;
		    }

		    /**
		     * View history of drug
		     *
		     * This transaction will be used to view the lifecycle of
		     * the product by fetching transactions from the blockchain.
		     *
		     * @param ctx      The transaction context object
		     * @param drugName Name of the drug
		     * @param serialNo Serial number of the drug
		     * @returns
		     */
		    async viewHistory(ctx, drugName, serialNo) {
		        let drugKey = await validator.createDrugKey(ctx, drugName, serialNo);
		        let drugObject = await validator.getAsset(ctx, drugKey);

		        if (drugObject === false) {
		            throw new Error('Drug is not registered.');
		        }

				
		        let drugHistory = await validator.getDrugHistory(ctx, drugKey);

		        return drugHistory;
		    }

		    /**
		     * View current state of drug
		     *
		     * This transaction is used to view the current state of the Asset.
		     *
		     * @param ctx      The transaction context object
		     * @param drugName Name of the drug
		     * @param serialNo Serial number of the drug
		     * @returns
		     */
		    async viewDrugCurrentState(ctx, drugName, serialNo) {
		        let drugKey = await validator.createDrugKey(ctx, drugName, serialNo);
		        let drugObject = await validator.getAsset(ctx, drugKey);

		        if (drugObject === false) {
		            throw new Error('Drug is not registered.');
		        }

		        return drugObject;
		    }


}

module.exports = PharmaContract;

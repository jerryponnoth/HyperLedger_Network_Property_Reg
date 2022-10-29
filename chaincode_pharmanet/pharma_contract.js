'use strict';

const { Contract } = require('fabric-contract-api');
const helper = require('./helper');
const validator = require('./validator');


const roleObject =
{
    'Manufacturer': 1,
    'Distributor': 2,
    'Retailer': 3,
    'Transporter': null
};

class PharmaContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('PharmaContract');
    }

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('PharmaContract-PharmaContract Smart Contract Instantiated');
    }

    /**
     * Register a Company 		 *
     * Manufacturer, Distributor, Transporter, retailer needs to register their company to do tranasactions
     * Ideally each will have its own MSPID, for the sake of simplicity this is a test network with Org1MSP and Org2MSP.
     * Transactions from both MSP should be able to create a company 		 *
     * @param ctx       The transaction context object
     * @param companyCRN  Company CRN
     * @param companyName Company Name
     * @param location  Address of the company
     * @param organizationRole  Type of Organization (Manufacturer, Distributor, Retailer, Transporter etc)
     * @returns
     */
    async registerCompany(ctx, companyCRN, companyName, location, organizationRole) {
        // Create a new composite key for the new company account
        const companyKey = await helper.createCompanyKey(ctx, companyCRN, companyName);

        // Fetch company with given ID from blockchain
        let existingCompany = await helper.getAsset(ctx, companyKey);

        let heirarchy = roleObject[organizationRole];

        if (heirarchy === undefined) {
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
                organizationRole: organizationRole,
                hierarchyKey: heirarchy
            };
            await helper.storeAsset(ctx, companyKey, companyObject);

            return companyObject;
        }
    }

    /**
     * Add a Drug 		 *
     * Drug can be added only by the Manufacturer
     * Ideally Manufacturer will have its own MSPID, for the sake of simplicity this is a test network with Org1MSP and Org2MSP.
     * Org2MSP is treated as manufacturer and its validated that only Org2MSP will be able to add a drug  		 *
     * @param ctx       The transaction context object
     * @param drugName  Name of the Drug
     * @param serialNo  Serial Number of the Drug
     * @param mfgDate   Manufacture Date of Drug
     * @param expDate   Expiry Date for the Drug
     * @param companyCRN  Company CRN of the Drug
     * @returns
     */
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {

        const validFn = await validator.validateInitiator(ctx, "Org2MSP");
        if (validFn == false) {
            throw new Error('Only Manufacturer Account can initiate this transaction');
            return false;
        }

        // Create a new composite key for the new drug
        const drugKey = await helper.createDrugKey(ctx, drugName, serialNo);

        // Fetch drug with given ID from blockchain
        let existingDrug = await helper.getAsset(ctx, drugKey);
        if (existingDrug !== false) {
            throw new Error('Drug is already added.');
        } else {
            let companyKey = await helper.getCompanyKeyByCRN(ctx, companyCRN);
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
            await helper.storeAsset(ctx, drugKey, drugObject);

            return drugObject;
        }
    }

    /**
     * Create a Purchase Order (PO)
     *
     * PO to order drug (Raised by Distributer or Retailer)
     *
     * @param ctx       The transaction context object
     * @param buyerCRN  Buyer CRN
     * @param sellerCRN Seller CRN
     * @param drugName  Name of the Drug for which PO raised
     * @param quantity  Number of units required
     * @returns
     */
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
			const validFn = validator.validateInitiator(ctx, "Org1MSP");
			if (validFn == false) {
					throw new Error('Manufacturer Account cannot initiate this transaction');
					return false;
			}

        let buyerObject = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObject === false) {
            throw new Error('Buyer is not registered.');
        }

        let sellerObject = await helper.getCompanyObjectByCRN(ctx, sellerCRN);
        if (sellerObject === false) {
            throw new Error('Seller is not registered.');
        }

        let buyerHierarchyKey = parseInt(buyerObject.hierarchyKey, 10);
        let sellerHierarchyKey = parseInt(sellerObject.hierarchyKey, 10);

        if (buyerHierarchyKey - sellerHierarchyKey !== 1) {
            throw new Error('Drug not ordered from a Hierarchy.')
            //Retailer cannot order drugs from manufacturer
        }

        const drugPOKey = await helper.createDrugPOKey(ctx, buyerCRN, drugName);
        let POObject = {
            poID: drugPOKey,
            drugName: drugName,
            quantity: quantity,
            buyer: buyerObject.companyID,
            seller: sellerObject.companyID
        }

        await helper.storeAsset(ctx, drugPOKey, POObject);

        return POObject;
    }

    /**
     * Create Shipment by manufacturer/distributor
     *
     * Seller invokes create shipment to respond to buyer request for PO  the buyer invokes the createPO transaction,
     * The transporter details is provided to ship the PO from Seller destination to Buyer destination
     *
     * @param ctx            The transaction context object
     * @param buyerCRN       Buyer CRN
     * @param drugName       Name of the drug
     * @param listOfAssets   List of assets
     * @param transporterCRN Transporter CRN
     * @returns
     */
    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        let buyerObject = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObject === false) {
            throw new Error('Buyer is not registered.');
        }

        let transporterObject = await helper.getCompanyObjectByCRN(ctx, transporterCRN);
        if (transporterObject === false) {
            throw new Error('Transporter is not registered.');
        }

        let drugPOKey = await helper.createDrugPOKey(ctx, buyerCRN, drugName);
        let drugPOObject = await helper.getAsset(ctx, drugPOKey);
        if (drugPOObject === false) {
            throw new Error('Purchase Order not found.');
        }
        // check quantity in PO and list of assets
        let quantity = parseInt(drugPOObject.quantity, 10);
        let assets = JSON.parse(listOfAssets).assets;
        if (assets.length !== quantity) {
            throw new Error('Drug PO quantity and shipment quantity do not match.');
        }
        // check if item in list of assets are valid registered IDs
        let drugObject;
        let drugObjects = {};
        let drugKeys = [];
        for (let drugSerial of assets) {
            let drugKey = await helper.createDrugKey(ctx, drugName, drugSerial);
            drugObject = await helper.getAsset(ctx, drugKey);
            if (drugObject === false) {
                throw new Error(drugSerial + ' is not a valid asset.');
            }
            drugObjects[drugKey] = drugObject;
            drugKeys.push(drugKey);
        }

        // Create Shipment
        const shipmentKey = await helper.createDrugShipmentKey(ctx, buyerCRN, drugName);
        let shipmentObject = {
            shipmentID: shipmentKey,
            creator: validator.getInitiatorMSP(),
            assets: drugKeys,
            transporter: transporterObject.companyID,
            status: "in-transit"
        }
        await helper.storeAsset(ctx, shipmentKey, shipmentObject);

        // update owner of items in the shipment
        for (let drugKey in drugObjects) {
            drugObject = drugObjects[drugKey];
            drugObject.owner = transporterObject.companyID;
            await helper.storeAsset(ctx, drugKey, drugObject);
        }

        return shipmentObject;
    }

    /**
     * Update shipment by transporter
     * Transporter marks the shipment as delivered when the shipment reaches buyer destination
     *
     * @param ctx            The transaction context object
     * @param buyerCRN       Buyer CRN
     * @param drugName       Name of the drug
     * @param transporterCRN Transporter CRN
     * @returns
     */
    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {

			const validFn = helper.validateInitiator(ctx, "Org1MSP");
			if (validFn == false) {
					throw new Error('Manufacturer Account cannot initiate this transaction');
					return false;
			}
        let transporterObject = await helper.getCompanyObjectByCRN(ctx, transporterCRN);
        if (transporterObject === false) {
            throw new Error('Transporter is not registered.');
        }

        let buyerObj = await helper.getCompanyObjectByCRN(ctx, buyerCRN);
        if (buyerObj === false) {
            throw new Error('Buyer is not registered.');
        }

        let shipmentKey = await helper.createDrugShipmentKey(ctx, buyerCRN, drugName);
        let shipmentObject = await helper.getAsset(ctx, shipmentKey);
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
        await helper.storeAsset(ctx, shipmentKey, shipmentObject);

        // Update owner and shipment details of assets
        let assets = shipmentObject.assets;
        let drugObject;
        for (let drugKey of assets) {
            drugObject = await helper.getAsset(ctx, drugKey);
            drugObject.owner = buyerObj.companyID;
            if (drugObject.shipment === null) {
                drugObject.shipment = [];
                drugObject.shipment.push(shipmentKey);
            } else {
                drugObject.shipment.push(shipmentKey);
            }
            await helper.storeAsset(ctx, drugKey, drugObject);
        }

        return shipmentObject;
    }

    /**
      * @param ctx            The transaction context object
      * @param drugName       Name of the drug
      * @param serialNo       Serial number of the drug
      * @param retailerCRN    Retailer CRN
      * @param customerAadhar Customer aadhar number
      * @returns
      */
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {

			const validFn = validator.validateInitiator(ctx, "Org1MSP");
			if (validFn == false) {
					throw new Error('Manufacturer Account cannot initiate this transaction');
					return false;
			}
        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);
        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }

        let retailerObject = await helper.getCompanyObjectByCRN(ctx, retailerCRN);
        if (retailerObject === false) {
            throw new Error('Retailer is not registered.');
        }

        let retailerHierarchyKey = parseInt(retailerObject.hierarchyKey, 10);
        if (retailerHierarchyKey !== roleObject['Retailer']) {
            throw new Error('Only Retailer can sell drug to customer.');
        }

        if (drugObject.owner !== retailerObject.companyID) {
            throw new Error('The Retailer must be owner of drug to sell.');
        }

        if (customerAadhar.length == 0) {
            throw new Error('Customer Aadhar is not valid.');
        }

        // update drug ownership
        drugObject.owner = customerAadhar;
        await helper.storeAsset(ctx, drugKey, drugObject);

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
        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);

        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }


        let drugHistory = await helper.getDrugHistory(ctx, drugKey);

        return drugHistory;
    }

    /**
     * View current state of drug
     * This function is used to view the current state of the Drug .
     *
     * @param ctx      The transaction context object
     * @param drugName Name of the drug
     * @param serialNo Serial number of the drug
     * @returns
     */
    async viewDrugCurrentState(ctx, drugName, serialNo) {
        let drugKey = await helper.createDrugKey(ctx, drugName, serialNo);
        let drugObject = await helper.getAsset(ctx, drugKey);

        if (drugObject === false) {
            throw new Error('Drug is not registered.');
        }

        return drugObject;
    }

}

module.exports = PharmaContract;

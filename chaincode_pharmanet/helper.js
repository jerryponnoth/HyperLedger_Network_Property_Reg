'use strict';

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


const storeAsset = async function (ctx, key, object) {
    let dataBuffer = Buffer.from(JSON.stringify(object));
    return await ctx.stub.putState(key, dataBuffer);
}

const createCompanyKey = async function (ctx, companyCRN, companyName) {
    return await ctx.stub.createCompositeKey(
        namesSpace['COMPANY'], [companyCRN, companyName]
    );
}

const getAsset = async function (ctx, key) {
    let assetBuffer = await ctx.stub
        .getState(key)
        .catch(err => console.log(err));

    if (assetBuffer.length === 0) {
        return false;
    }

    let assetObject = JSON.parse(assetBuffer.toString());

    return assetObject;
}

const createDrugKey = async function (ctx, drugName, serialNo) {
    return await ctx.stub.createCompositeKey(
        namesSpace['DRUG'], [drugName, serialNo]
    );
}

const createDrugPOKey = async function (ctx, buyerCRN, drugName) {
    return await ctx.stub.createCompositeKey(
        namesSpace['DRUG_PO'], [buyerCRN, drugName]
    );
}

const createDrugShipmentKey = async function (ctx, buyerCRN, drugName) {
    return await ctx.stub.createCompositeKey(
        namesSpace['DRUG_SHIPMENT'], [buyerCRN, drugName]
    );
}


const getCompanyKeyByCRN = async function (ctx, companyCRN) {
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

const getCompanyObjectByCRN = async function (ctx, companyCRN) {
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

const getDrugHistory = async function (ctx, key) {
    let historyList = await ctx.stub
        .getHistoryForKey(key)
        .catch(err => console.log(err));

    // console.log(historyList);

    let history = [];
    while (true) {
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
module.exports = {storeAsset, createCompanyKey, getAsset, createDrugKey, createDrugPOKey, createDrugShipmentKey, getCompanyKeyByCRN, getCompanyObjectByCRN, getDrugHistory };

'use strict';

const {Contract} = require('fabric-contract-api');
const validator = require('./validator');

class UserContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
		super('user.all');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Regnet User Smart Contract Instantiated');
	}


	async createUserRequest(ctx, name,email, phone, social) {
		//Validate access for User Account
		const validFn = validator.validateInitiator(ctx,"Org1MSP");
		if (validFn==false)
		{
			throw new Error('Only User Account can initiate this transaction');
			return false;
		}
		// Create a new composite key for the new student account
		const requestKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.requests', [name,social]);

		// Create a student object to be stored in blockchain
		let newRequestObject = {
			docType: 'user',
			name: name,
			email: email,
      phone:  phone,
      social: social,
			createdAt: ctx.stub.getTxTimestamp(),
		};

		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newRequestObject));
		await ctx.stub.putState(requestKey, dataBuffer);
		// Return value of new student account created to user
		return newRequestObject;
	}

	async rechargeAccount(ctx, name, social, bankTransactionID)
{
	//Validate access for User Account
	const validFn = validator.validateInitiator(ctx,"Org1MSP");
	if (validFn==false)
	{
		throw new Error('Only User Account can initiate this transaction');
		return false;
	}

	const userKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);
	let userBuffer = await ctx.stub
			.getState(userKey)
			.catch(err => console.log(err));
	if(userBuffer) {
		 var userObject = JSON.parse(userBuffer.toString());
		 console.log(userObject);
	 	}
	else {
		return 'Asset with key ' + name + ' does not exist on the network';

		}
		let numUpgradCoins = 0;
		console.log(userObject);

		if (bankTransactionID == 'upg100')
				numUpgradCoins = 100;
		else if (bankTransactionID == 'upg500')
				numUpgradCoins = 500;
		else if (bankTransactionID == 'upg1000')
				numUpgradCoins = 1000;
		else
				numUpgradCoins = 0;
	console.log(numUpgradCoins);
	if (numUpgradCoins != 0)
	{
		userObject.upgradCoins= userObject.upgradCoins+numUpgradCoins;
		let dataBuffer = Buffer.from(JSON.stringify(userObject));
		await ctx.stub.putState(userKey, dataBuffer);
		return userObject;
	}
	else{
		throw new Error('Not allowed to update balance: Invalid Bank Transaction ID' );
	}
	}

	async propertyRegistrationRequest(ctx, name, social, propertyID, price)
{
	//Validate access for User Account
	const validFn = validator.validateInitiator(ctx,"Org1MSP");
	if (validFn==false)
	{
		throw new Error('Only User Account can initiate this transaction');
		return false;
	}

	const propertyReqKey= ctx.stub.createCompositeKey('org.property-user-network.regnet.propertyReq', [propertyID]);
	const userKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);
	let userBuffer = await ctx.stub
			.getState(userKey)
			.catch(err => console.log(err));
	if(userBuffer) {
		 let newPropertyReqObject={
			 requestID: propertyReqKey,
			 owner: userKey,
			 price: parseInt(price),
			 status: 'registered'
		 };
		let dataBuffer = Buffer.from(JSON.stringify(newPropertyReqObject));
 		await ctx.stub.putState(propertyReqKey, dataBuffer);
		return newPropertyReqObject;
		}
	else {
		return 'Asset with key ' + name + ' does not exist on the network';

		}

	}

async viewProperty(ctx, propertyID)
{

	const propertyKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.property', [propertyID]);
	let propertyBuffer = await ctx.stub
			.getState(propertyKey)
			.catch(err => console.log(err));
	if(propertyBuffer) {

	return JSON.parse(propertyBuffer.toString());;
}
else {
	return 'Asset with key ' + propertyID + ' does not exist on the network';
}

}

async updateProperty(ctx, propertyID, name, social, status)
{

	//Validate access for User Account
	const validFn = validator.validateInitiator(ctx,"Org1MSP");
	if (validFn==false)
	{
		throw new Error('Only User Account can initiate this transaction');
		return false;
	}

	const owner = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);

	const propertyKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.property', [propertyID]);
	let propertyBuffer = await ctx.stub
			.getState(propertyKey)
			.catch(err => console.log(err));
	if(propertyBuffer) {

	var propertyObject = JSON.parse(propertyBuffer.toString());;
}
else {
	return 'Asset with key ' + propertyID + ' does not exist on the network';
}

	console.log(propertyObject);
	console.log(owner);
	if (propertyObject.owner === owner)
	{
		propertyObject.status= status;

		let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
		await ctx.stub.putState(propertyKey, dataBuffer);

	}
	else
		throw new Error('User: '+ name + ' with social: '+ social + 'not authorised to make this transaction');
	}

	async purchaseProperty(ctx, propertyID, name, social)
{

	//Validate access for User Account
	const validFn = validator.validateInitiator(ctx,"Org1MSP");
	if (validFn==false)
	{
		throw new Error('Only User Account can initiate this transaction');
		return false;
	}
	
	const buyerKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);
	let buyerBuffer = await ctx.stub
			.getState(buyerKey)
			.catch(err => console.log(err));
	let buyerObject = JSON.parse(buyerBuffer.toString());
	const propertyKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.property', [propertyID]);
	let propertyBuffer = await ctx.stub.getState(propertyKey).catch(err => console.log(err));
	let propertyObject= JSON.parse(propertyBuffer.toString());

	let sellerKey= propertyObject.owner;
	let sellerBuffer = await ctx.stub.getState(sellerKey).catch(err => console.log(err));
	let sellerObject= JSON.parse(sellerBuffer.toString());

	if (buyerObject === undefined)
		throw new Error('User: '+ name + ' with social: '+ social + 'not registered on the property registration network');
	if (propertyObject.status !== 'onSale')
		throw new Error('Property with PropertyID: '+ propertyID + 'not registered for sale. Please contact the owner of the property. :)');

	if (buyerObject.upgradCoins >= propertyObject.price)
	{
		propertyObject.owner=buyerKey;
		propertyObject.status = 'registered';
		sellerObject.upgradCoins += propertyObject.price;
		buyerObject.upgradCoins -= propertyObject.price;
		let dataBuffer = Buffer.from(JSON.stringify(propertyObject));
		await ctx.stub.putState(propertyKey, dataBuffer);
		dataBuffer = Buffer.from(JSON.stringify(sellerObject));
		await ctx.stub.putState(sellerKey, dataBuffer);
		dataBuffer = Buffer.from(JSON.stringify(buyerObject));
		await ctx.stub.putState(buyerKey, dataBuffer);

	}
	else
		throw new Error('Buyer has insufficient funds');
}

}
module.exports = UserContract;

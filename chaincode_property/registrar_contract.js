'use strict';

const {Contract} = require('fabric-contract-api');
const validator = require('./validator');

class RegistrarContract extends Contract {

	constructor() {
		// Provide a custom name to refer to this smart contract
        super('registrar');
	}

	/* ****** All custom functions are defined below ***** */

	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Regnet-Registrar Smart Contract Instantiated');
    }

	async approveNewUser(ctx, name, social)
	{
		//Validate access for Registrar  Account
		const validFn = validator.validateInitiator(ctx,"Org2MSP");
		console.log(validFn);
		if (validFn==false)
		{
			throw new Error('Only Registrar Account can initiate this transaction');
			return false;
		}

    const requestKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.requests', [name,social]);
		const newUserKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);

    let reqBuffer = await ctx.stub.getState(requestKey).catch(err => console.log(err));
    if(reqBuffer) {
      let requestObject = JSON.parse(reqBuffer.toString());
			let newUserObject={
				requestID: requestKey,
				name: requestObject.name,
				email: requestObject.email,
				social: requestObject.social,
				phone: requestObject.phone,
				upgradCoins: 0,
				createdAt: ctx.stub.getTxTimestamp()
				};
			let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
			await ctx.stub.putState(newUserKey, dataBuffer);
			// Return value of new student account created to user
			return newUserObject;
    } else {
      return 'Asset with key ' + name + ' does not exist on the network';
    }
	  }

		async viewUser(ctx, name, social)
		{
			const userKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.users', [name,social]);
			let userBuffer = await ctx.stub
					.getState(userKey)
					.catch(err => console.log(err));
			if(userBuffer) {
				 return JSON.parse(userBuffer.toString());
			 }
			else {
				return 'Asset with key ' + name + ' does not exist on the network';

				}
		}

	async approvePropertyRegistration(ctx, propertyID)
	{
		//Validate access for Registrar  Account
		const validFn = validator.validateInitiator(ctx,"Org2MSP");
		if (validFn==false)
		{
			throw new Error('Only User Account can initiate this transaction');
			return false;
		}

		const requestKey= ctx.stub.createCompositeKey('org.property-user-network.regnet.propertyReq', [propertyID]);
		const propertyKey = ctx.stub.createCompositeKey('org.property-user-network.regnet.property', [propertyID]);
		let propertyBuffer = await ctx.stub
				.getState(requestKey)
				.catch(err => console.log(err));
		if(propertyBuffer) {

			var propertyReqObj = JSON.parse(propertyBuffer.toString());;
	}
	else {
		return 'Asset with key ' + propertyID + ' does not exist on the network';
	}

		if (propertyReqObj !== undefined)
		{
			let newPropertyObject={
				propertyID: propertyKey,
				owner: propertyReqObj.owner,
				price: propertyReqObj.price,
				status: 'registered'
			};

			let dataBuffer = Buffer.from(JSON.stringify(newPropertyObject));
			await ctx.stub.putState(propertyKey, dataBuffer);
			return newPropertyObject;

		}
		else
			throw new Error('Request for PropertyID: '+ propertyID + ' not registered');
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

}

module.exports = RegistrarContract;

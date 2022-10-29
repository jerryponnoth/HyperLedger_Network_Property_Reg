'use strict';

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
}

module.exports=validator;

'use strict';

const validateInitiator = async function (ctx, initiator)
{
	// const initiatorMSP = await ctx.stub.getCreator();
	const initiatorMSP =  ctx.clientIdentity.getMSPID();
	if(initiatorMSP===initiator){
	return true;}
	else{
	return false;}
}

const getInitiatorMSP = async function (ctx)
{
	const initiatorMSP = await ctx.stub.getCreator();
	return initiatorMSP;

}

module.exports = {validateInitiator,getInitiatorMSP};

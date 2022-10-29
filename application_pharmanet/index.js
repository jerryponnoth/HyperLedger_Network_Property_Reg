const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewDrugCurrentState = require('./8_getCurrentState');
const viewHistory = require('./9_getDrugHistory');

// Define Express app settings
app.use(cors());
app.use(express.json());// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharmaceutical Fraud Prevention and Tracking Application');

app.get('/', (req,res) => res.send('Welcome to Pharmaceutical Fraud Prevention and Tracking Application!'));

app.post('/addToWallet', (req,res) => {
	addToWallet.execute(req.body.certPath, req.body.keyFilePath, req.headers['mspid'])
		.then((response) => {
			console.log('Identity Added to Wallet.');
			const result = {
				status: 'success',
				message: 'Identity Added to Wallet.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/registerCompany', (req,res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organizationRole, req.headers['mspid'])
		.then((response) => {
			const result = {
				status: 'success',
				message: 'New Company registered.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/addDrug', (req,res) => {
	console.log("Add drug");
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN, req.headers['mspid'])
		.then((response) => {
			console.log('New Drug added.');
			const result = {
				status: 'success',
				message: 'New Drug added.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const err = JSON.stringify(e);
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/createPO', (req,res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity, req.headers['mspid'])
		.then((response) => {
			console.log('New Purchase order created.');
			const result = {
				status: 'success',
				message: 'New Purchase order created.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/createShipment', (req,res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN, req.headers['mspid'])
		.then((response) => {
			console.log('Shipment created.');
			const result = {
				status: 'success',
				message: 'Shipment created.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/updateShipment', (req,res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.headers['mspid'])
		.then((response) => {
			console.log('Shipment udpated by Transporter');
			const result = {
				status: 'success',
				message: 'Shipment udpated by Transporter',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/retailDrug', (req,res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar, req.headers['mspid'])
		.then((response) => {
			console.log('Drug has been sold to customer.');
			const result = {
				status: 'success',
				message: 'Drug has been sold to customer.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/viewHistory', (req,res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo, req.headers['mspid'])
		.then((response) => {
			console.log('Fetch Drug history is successful.');
			const result = {
				status: 'success',
				message: 'Fetch Drug history is successful.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.post('/viewDrugCurrentState', (req,res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo, req.headers['mspid'])
		.then((response) => {
			console.log(response);
			console.log('Get Current state of Drug is successful.');
			const result = {
				status: 'success',
				message: 'Get Current state of Drug is successful.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: String(e)
			};
			res.status(500).send(result);
		});
});

app.listen(port, () => console.log(`Pharmaceutical Fraud Prevention and Tracking Application ${port}!`));

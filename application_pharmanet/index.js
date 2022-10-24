const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

const registerCompany = require('./2_registerCompany');
const addDrug = require('./3_addDrug');
const createPO = require('./4_createPO');
const createShipment = require('./5_createShipment');
const updateShipment = require('./6_updateShipment');
const retailDrug = require('./7_retailDrug');
const viewDrugCurrentState = require('./8_currentStateInquiry');
const viewHistory = require('./9_getDrugHistory');

// Define Express app settings
app.use(cors());
app.use(express.json());// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma Application');

app.get('/', (req,res) => res.send('Welcome to Pharma Network'));

app.post('/registerCompany', (req,res) => {
	registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organizationRole)
		.then((response) => {
			console.log('New Company registered.');
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
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/addDrug', (req,res) => {
	addDrug.execute(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN)
		.then((response) => {
			console.log('New Drug added.');
			const result = {
				status: 'success',
				message: 'New Drug added.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/createPO', (req,res) => {
	createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
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
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/createShipment', (req,res) => {
	createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
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
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/updateShipment', (req,res) => {
	updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
		.then((response) => {
			console.log('Shipment udpated into the network');
			const result = {
				status: 'success',
				message: 'Shipment updated into the network',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/retailDrug', (req,res) => {
	retailDrug.execute(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar)
		.then((response) => {
			console.log('Drug has been bought.');
			const result = {
				status: 'success',
				message: 'Drug has been bought.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/viewHistory', (req,res) => {
	viewHistory.execute(req.body.drugName, req.body.serialNo)
		.then((response) => {
			console.log('Drug history has been displayed.');
			const result = {
				status: 'success',
				message: 'Drug history has been displayed.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.post('/viewDrugCurrentState', (req,res) => {
	viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo)
		.then((response) => {
			console.log('Current state of Drug has been displayed.');
			const result = {
				status: 'success',
				message: 'Current state of Drug has been displayed.',
				response: response
			};
			res.json(result);
		}).catch((e) => {
			const result = {
				status: 'error',
				message: 'Failed',
				error: e
			};
			res.status(500).send(result);
		});
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));

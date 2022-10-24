/**
 * Define different namespaces and export
 */
exports.Namespaces = function() {
	return Object.freeze({
		COMPANY: 'org.pharma-network.pharmanet.company',
		MANUFACTURER: 'org.pharma-network.pharmanet.manufacturer',
		DISTRIBUTOR: 'org.pharma-network.pharmanet.distributor',
		RETAILER: 'org.pharma-network.pharmanet.retailer',
		CONSUMER: 'org.pharma-network.pharmanet.consumer',
		TRANSPORTER: 'org.pharma-network.pharmanet.transporter',
		DRUG: 'org.pharma-network.pharmanet.drug',
		DRUG_PO: 'org.pharma-network.pharmanet.drug.po',
		DRUG_SHIPMENT: 'org.pharma-network.pharmanet.drug.shipment'
	});
};

/**
 * Different organization roles
 */
exports.OrganizationRoles = function() {
	return ['Manufacturer', 'Distributor', 'Retailer', 'Transporter'];
};

/**
 * Hierarchy Key based on its position in the supply chain
 */
exports.HierarchyKey = function() {
	return Object.freeze({
		'Manufacturer':  1,
		'Distributor': 2,
		'Retailer': 3,
		'Transporter': null
	});
};

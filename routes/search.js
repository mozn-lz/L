const express = require('express');
const router = express.Router();
const { db_search } = require('./db_helper');

let find_suppliers = (str) => {
	return new Promise((resolve, reject) => {
		db_search('suppliers', 'supplier_name', str, suppliers => {
			console.log('1', suppliers.length);
			resolve(suppliers);
		});
	});
}
let find_products = (str) => {
	return new Promise((resolve, reject) => {
		db_search('products', 'product_name', str, products => {
			console.log('2', products.length);
			resolve(products);
		});
	});
}
let find_promotions = (str) => {
	return new Promise((resolve, reject) => {
		db_search('promotions', 'promotion_name', str, promotions => {
			console.log('3', promotions.length);
			resolve(promotions);
		});
	});
}
router.post('/search', (req, res, next) => {
	let response={};

	const findStr = req.body.searchString;
	if (findStr && findStr.length > 1) {
		/**
		 * Figure out if findStr is invalid and queries produce errors
		 */
		 let p1 =find_suppliers('%'+ findStr.toLowerCase()+ '%');
		 let p2 =find_products('%'+ findStr.toLowerCase()+ '%');
		 let p3 =find_promotions('%'+ findStr.toLowerCase()+ '%');

		 Promise.all([p1, p2, p3]).then(values => {
			 console.log('v', values);
			 response = { suppliers: values[0], products: values[1], promotions: values[2] }
			res.send(response);
		 });
		 
	} else {
		res.send("String too short");
	}
});

module.exports = router;

const express = require('express');
const { authUser, authRole, ROLE } = require('./auth');
const router = express.Router();
const { db_read, db_read_products, db_read_promos, db_update, db_advanced_read, db_gen_advanced_read } = require('./db_helper');
const { } = require('./gen_helper');


// PRODUCTS ROUTE
router.get('/', (req, res, next) => {
	console.log('		/');
	let users = [];
	res.render('index', { user: req.session.user, title: 'LesDiaspora', users });
});
router.get('/filter-users', (req, res, next) => {
		console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n		************** /:category **************');
		console.log('/:category', req.body, req.query);
		const limit = 20;
		const offset = req.query.scrollCounter;
		let sort = '';
		let orderBy = '';
		let query = '';


		if (req.query.order == 'polularity') {
				orderBy = 'hits';
		} else if (req.query.order == 'name') {
				orderBy = 'product_name';
		} else if (req.query.order == 'supplier') {
				orderBy = 'supplier_name';
		} else if (req.query.order == 'price') {
				orderBy = 'product_price';
		} else {
				// default
				orderBy = 'id';
		}
		(Number(offset) == NaN) ? offset = 0: 0;
		(req.query.sort == 'ascending') ? sort = 'ASC': sort = 'DESC';
		// (req.query.category) ? query = { industry: req.query.category }:
		 query = 1;

		console.log('offset ', offset);
		console.log('sort ', sort);
		console.log('orderBy ', orderBy);
		console.log('query ', query);
		console.log('query ', limit);
		db_advanced_read('users', query, orderBy, sort, offset, limit)
				.then(users => {
						console.log('users: ', users.length);
						res.send({ success: true, users });
				}).catch(e => {
						res.send({ success: false, msg: e });
				});
});
// PUBLIC
router.get('/profile/:id', (req, res, next) => {
		console.log('		/:view-prod/:id');
		db_read_products('products', { id: req.params.id }, products => {
				if (products.length > 0) {
						const product = products[0];
						// registerHit('products', product, );
						res.render('view-product', { user: req.session.user, title: product.productName, product });
				} else {
						res.redirect('/index');
				}
		});
});
router.get('/profile', (req, res, next) => {
	console.log('		/profile');
	let users = [];
	res.render('profile', { user: req.session.user, title: 'Profile', users });
});

router.get('/contact', (req, res, next) => {const user = 'admin';res.render('contact', {title: 'Contact', user});});
router.post('/contact', (req, res, next) => {const user = 'admin';res.render('contact', {title: 'Contact', user});});
router.get('/residence', (req, res, next) => {const user = 'admin';res.render('residence', {title: 'Residence', user});});
router.post('/residence', (req, res, next) => {const user = 'admin';res.render('residence', {title: 'Residence', user});});
router.get('/job', (req, res, next) => {const user = 'admin';res.render('job', {title: 'Job', user});});
router.post('/job', (req, res, next) => {const user = 'admin';res.render('job', {title: 'Job', user});});

router.get('/logout', (req, res, next) => {
		req.session.destroy();
		res.redirect('/login/');
});

router.post('/', (req, res, next) => {
		console.log('116 ', req.body);

		const hitPath = req.body.hitPath;

		console.log('**************** hit counter ****************\n');

		if (req.body.load_products) {
				// TRANSLATE PROMOTION'S PRODUCT_LIST TO PRODUCTS 
				const id = req.body.promoId;

				db_read('promotions', { id }, promotion => {
						if (promotion[0].id == id && promotion[0].product_list.length > 0) {
								findProductsbyId(JSON.parse(promotion[0].product_list))
										.then(products => { res.send({ success: 'true', products: products.reverse() }) })
										.catch(e => { res.send({ success: 'false', msg: e }) });
						} else {
								res.send({ success: 'false', msg: 'Promotion not found' });
						}
				});
		} else if (hitPath && (hitPath.includes('view-product/') ||
						hitPath.includes('view-special/') || hitPath.includes('view-supplier/'))) {
				let id = hitPath.split(/(\d)/);
				id = id[1];

				if (hitPath.includes('view-product/')) {
						console.log('* hit_counter products');
						db_read('products', { id }, products => {
								const hits = fn_hitCount(Number(products[0].hits));
								db_update('products', { id }, { hits }, updated => {
										res.send({ success: true, msg: 'Thank You' });
								});
						});
				} else if (hitPath.includes('view-special/')) {
						console.log('* hit_counter Promotion');
						db_read('specials', { id }, specials => {
								const hits = fn_hitCount(Number(specials[0].hits));
								db_update('specials', { id }, { hits }, updated => {
										res.send({ success: true, msg: 'Thank You' });
								});
						});
				} else if (hitPath.includes('view-supplier/')) {
						console.log('* hit_counter Supplier');
						db_read('suppliers', { id }, suppliers => {
								const hits = fn_hitCount(Number(suppliers[0].hits));
								db_update('suppliers', { id }, { hits }, updated => {
										res.send({ success: true, msg: 'Thank You' });
								});
						});
				} else {
						console.log('* nothing');
						res.send('Thank You');
				}
		} else {
				console.log('* hit_counter FUCK YOU');
				res.send('Thanks You');
		}
});

module.exports = router;
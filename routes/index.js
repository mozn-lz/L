const express = require('express');
const { authUser, authRole, ROLE } = require('./auth');
const router = express.Router();
const { db_read, db_read_products, db_read_promos, db_update, db_advanced_read, db_gen_advanced_read } = require('./db_helper');
const { } = require('./gen_helper');

const findUserById = (id) => {
	return new Promise((res, rej) => {
		db_read('users', {id}, user => {
			console.log(user, '\n', user.length);
			if (user.length == 1){
				res(user);
			}else{
				rej('user not found');}
		});
	});
}

// ROUTE
router.get('/', (req, res, next) => {
	console.log('		/');
	if (!req.session.user) {
		console.log('		redirect');
		res.redirect('/login/');
	} else {
		console.log('		Cool', req.session.user.id);
		findUserById(req.session.user.id)
		.then(users => {
			user = users[0]
			// res.render('contact', {title: 'Contact', user});
			res.render('index', { user: user, title: 'LesDiaspora', user });
		}).catch(e => {
			console.log(e);
			res.redirect('/login/');
		});
	}
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
	if (!req.session.user) {
		res.redirect('/login/');
	} else {
		console.log('		/:view-prod/:id ', req.params.id);
		db_read('users', { id: req.params.id }, users => {
			console.log(users);
			if (users.length > 0) {
				const user = users[0];
				res.render('profile', { user: req.session.user, title: user.name, user });
			} else {
				res.redirect('/index');
			}
		});
	}
});
router.get('/profile', (req, res, next) => {
	console.log('		/profile');
	if (!req.session.user){res.redirect('/login/')}else{
		// res.redirect('/profile/' + req.session.user.id);
		res.render('profile', { user: req.session.user, title: 'Profile' });
	}
});

router.get('/contact', (req, res, next) => {
	if (!Object.keys(req.session.user).length) {
		res.redirect('/login/');
	} else {
		findUserById(req.session.user.id).then( user => {
			res.render('contact', {title: 'Contact', user});
		}).catch(e => { res.redirect('/login/') });
	}
});
router.get('/job', (req, res, next) => {
	if (!Object.keys(req.session.user).length) {
		res.redirect('/login/');
	} else {
		findUserById(req.session.user.id).then( user => {
			res.render('job', {title: 'Job', user});
		}).catch(e => { res.redirect('/login/') });
	}
});
router.get('/residence', (req, res, next) => {
	if (!Object.keys(req.session.user).length) {
		res.redirect('/login/');
	} else {
		findUserById(req.session.user.id).then( user => {
			res.render('residence', {title: 'Residence', user});
		}).catch(e => { res.redirect('/login/') });
	}
});
router.get('/password', (req, res, next) => {
	if (!Object.keys(req.session.user).length) {
		res.redirect('/login/');
	} else {
		findUserById(req.session.user && req.session.user.id).then( user => {
			console.log('user ', user)
			res.render('password', {title: 'Contact', user});
		}).catch(e => { res.redirect('/login/') });
	}
});

router.post('/contact', (req, res, next) => {
	console.log('** CONTACT');
	if (!req.session.user) {
		res.redirect('/login/');
	} else {
		const contact = {};
		const email			= req.body.email;
		const cell_1 		= req.body.cell1;
		const cell_2 		= req.body.cell2;
		let msg = '';

		if (check_email(email) || check_tel(cell_1) || check_tel(cell_2)) {

			email ? contact.email = email : 0;
			cell_1 ? contact.cell_1 = cell_1 : 0;
			cell_2 ? contact.cell_2 = cell_2 : 0;

			db_update('users', { id: req.session.user.id }, contact, (response) => {
				
				email ? msg = 'Please check your email to confirm your email address': 0;
				cell_1 ? msg = 'Contact number changed' : 0;
				cell_2 ? msg = 'Contact number changed' : 0;

				// res.redirect('/profile/' + req.session.user.id);
				res.send({ success: true, msg });
			});
		} else {
			email ? msg = `Invalid email ${email}\n` : 0;
			cell_1 ? msg = `Invalid cell ${cell_1}\n` : 0;
			cell_2 ? msg = `Invalid cell ${cell_2}\n` : 0;
			res.send({ success: false, msg });
		}
	}
});
router.post('/job', (req, res, next) => {
	console.log('** WORK');
	if (!req.session.user){
		res.redirect('/login/');
	} else {
		const job = {
			organisation: req.body.organisation,
			position: req.body.position,
			salary: req.body.salary
		};

		db_update('users', { id: req.session.user.id }, job, (response) => {
			res.send({ success: true, msg: 'Work Updated' });
		});
	}
});
router.post('/residence', (req, res, next) => {
	console.log('** RESIDENCE');
	if (!req.session.user){
		res.redirect('/login/');
	} else {
		const location = {
			country: req.body.country,
			region: req.body.region,
			address: req.body.address
		};

		db_update('users', { id: req.session.user.id }, location, (response) => {
			// res.redirect('/profile/' + req.session.user.id);
				res.send({ success: true, msg: 'Location updated' });
		});
	}
});
router.post('/password', (req, res, next) => {
	console.log('** password');
	if (!req.session.user){
		res.redirect('/login/');
	} else {
		const password	= req.body.password;
		const old_password = req.body.old_password;

		if (check_psswd(password) && password === req.body.confirmPassword) {
			findUserById(req.session.user.id).then( user => {
				bcrypt.compare(user.password, db_user[0].password, function(err, passwordMatch) {
					if (err || !passwordMatch) {
							// password isfucked
							console.log('** 1. password isfucked');
							res.send({ success: false, msg: 'User password missmatch' });
					} else {
						bcrypt.hash(password, rounds, function(err, hash) {
							if (hash) {
								db_update('users', { id: req.session.user.id }, {password: hash}, (response) => {
									res.send({ success: true, msg: 'Password changed' });
								});
							} else{
								res.send({ success: false, msg: 'Password change error' });
							}
						});
					}
				});
			}).catch(e => {
				// redirect to login
				res.send({ success: false, msg: 'Error: sessoin corrupted\nPlease try again after re-loggin in' });
			});
		} else {
			res.send({ success: false, meg: 'Invalid password' });
		}
	}
});

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
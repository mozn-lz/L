const express = require('express');
const router = express.Router();
const { db_update, db_advanced_read } = require('./db_helper');
const { findUserById } = require('./gen_helper');
const { authUser, authRole, ROLE } = require('./auth');

// ROUTE
router.get('/', (req, res, next) => {
	console.log('		/');
	// if (!req.session.user) {
	// 	console.log('		redirect');
	// 	res.redirect('/login/');
	// } else {
		findUserById(1)
		.then(user => {
			// res.render('user', {title: 'Contact', user});
			res.render('index', { title: 'Tsepa Insure', user });
		}).catch(e => {
			console.log(e);
			res.redirect('/login/');
		});
	// }
});
router.get('/filter-users', (req, res, next) => {
	console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n		************** /:category **************');
	console.log('/:category', req.body, req.query);
	const limit = 20;
	const offset = req.query.scrollCounter;
	let sort = '';
	let orderBy = '';
	let query = '';

	// ORDER
	switch (req.query.order) {
		case 'name': orderBy = 'name'; break;
		case 'surname': orderBy = 'surname'; break;
		case 'birth': orderBy = 'birth'; break;
		default: orderBy = 'name'; break;
	}
	(Number(offset) == NaN) ? offset = 0: 0;
	(req.query.sort == 'ascending') ? sort = 'ASC': sort = 'DESC';

	/**
	 * title	* status
	 * name		* surname
	 * gender	* birth
	 * email	* policy
	 */
	// QUERY
	switch (req.query.search) {
		case 'title': query = 'title'; break;
		case 'status': query = 'status'; break;
		case 'name': query = 'name'; break;
		case 'surname': query = 'surname'; break;
		case 'gender': query = 'gender'; break;
		case 'birth': query = 'birth'; break;
		case 'email': query = 'email'; break;
		case 'policy': query = 'policy'; break;
		default: query = 1; break;
	}
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
		console.log('error: ', e);
		res.send({ success: false, msg: e });
	});
});
// PUBLIC
router.get('/profile/:id', (req, res, next) => {
	// if (!req.session.user) {res.redirect('/login/');} else {
		console.log('		/:view-prod/:id ', req.params.id);
		findUserById(req.params.id).then(user => {
			console.log(user);
			res.render('profile', { user: req.session.user, title: user.name, user });
		}).catch(e => {
			res.redirect('/index');
		});
	// }
});
router.get('/profile', (req, res, next) => {
	console.log('		/profile');
	if (!req.session.user){res.redirect('/login/')}else{
		// res.redirect('/profile/' + req.session.user.id);
		res.render('profile', { user: req.session.user, title: 'Profile' });
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
								db_update('users', { id: req.session.user.id }, {password: hash}, (err, response) => {
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


module.exports = router;
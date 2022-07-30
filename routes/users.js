const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const rounds = 10;

const { db_read, db_create, db_update } = require('./db_helper');
const { check_email, check_tel, check_name, check_psswd } = require('./credential_validator');
const {regusrs }  = require('./fakeData');
const { findAdminById } = require('./gen_helper');

const table = 'admin';

// view admin
router.get('/view-admin', (req, res) => {
	db_read(table, '', (err, users) => {
		console.log(users);
		// users[0].active = false;
		res.render('view_users', {users, title: 'view users', user: users[0]});
	});
});
router.get('/edit-admin/:id', (req, res) => {
	findAdminById(req.params.id).then(a_user => {
		console.log(a_user);
		// users[0].active = false;
		res.render('new_admin', { user: a_user, title: 'Edit ' + a_user.name, a_user });
	}).catch(e => res.redirect('view-admin'));
});
router.get('/edit-admin', (req, res) => {
	db_read(table, '', (err, users) => {
		console.log(err, users);
		// users[0].active = false;
		res.render('new_admin', {user: users[0], title: 'view users', a_user: false});
	});
});
router.get('/login', function(req, res, next) {
		regusrs();	// generate users
		gen_db_read(table, '').then(users => {	//	for sample data
			res.render('login', { user: req.session.user, users, title: 'Login', page: 'Login', role: '' });
		});
});

let fn_register = (user) => {
		console.log('**   fn_register **', user);
		return new Promise((resolve, reject) => {
				bcrypt.hash(user.password, rounds, function(err, hash) {
						console.log('**   hashing **');
						user.password = hash;
						// save hash as user password; then save new user
						(!hash) ? reject(false):
								db_create(table, user, (newUserRes) => { resolve(true); });
				});
		});
}
let fn_findUser = (user) => {
	console.log('fn_finduser ', user);
	return new Promise((resolve, reject) => {
		db_read(table, { cell_1: user.cell_1 }, (err, cellUser) => {
			console.log('cellUser ', cellUser);
			db_read(table, { cell_2: user.cell_2 }, (err, cellUser1) => {
				console.log('cellUser1 ', cellUser1);
				db_read(table, { email: user.email }, (err, emailUser) => {
					console.log('emailUser ', emailUser);
					db_read(table, { username: user.username }, (err, username) => {
						console.log('username ', username);
						if (user.cell_1 && cellUser[0]) {
							resolve(cellUser[0]);
						} else if (user.cell_2 && cellUser1[0]) {
							resolve(cellUser1[0]);
						} else if (user.email && emailUser[0]) {
							resolve(emailUser[0]);
						} else if (user.username && username[0]) {
							resolve(username[0]);
						} else {
							reject(false);
						}
					});
				});
			});
		});
	});
}
let removeUser = (_id, active) => {
	return new Promise((res, rej) => {
		db_update(table, {_id}, {active}, (err, data) => {
			console.log('\n update admin ', err, data);
			err ? rej(err): res(data);
		});
	});
}
let editAdmin = (_id, userEdit) => {
	console.log('fn_edit data ');
	return new Promise((res, rej) => {
		console.log('fn_edit data ');
		db_update(table, {_id}, userEdit, (err, data) => {
			console.log('\n edit admin ', err, data);
			err ? rej(err): res(data);
		});
	});
}

router.post('/login', (req, res, next) => {
	console.log("\n ** ** ** ** ** ** MESSAGE RECIEVED ** ** ** ** ** ** * \n", req.body, '\n');
	if (req.body.login) {
		console.log('LOGIN');
			const user = {
					cell_1: req.body.cell,
					cell_2: req.body.cell,
					username: req.body.cell.toUpperCase(),
					email: req.body.cell,
					password: req.body.password
			};
			fn_findUser(user).then(db_user => {
				console.log('user.password. ', user.password, db_user, db_user.password);
					bcrypt.compare(user.password, db_user.password, function(err, passwordMatch) {
							console.log('PM: ', passwordMatch);
							if (err || !passwordMatch) {
									// password isfucked
									console.log('** 1. password isfucked');
									res.send({ success: false, msg: 'User password missmatch' });
							} else {
									// successfully loggedin
									console.log('** lets login');
									req.session.user = {
										id: db_user._id,
										email: db_user.email,
										cell: db_user.cell,
										name: db_user.name,
										surname: db_user.surname
									};

									// re-fucken-spond
									res.send({ success: true, msg: 'logged in successfully', id: db_user._id });
							}
					});
			}).catch((e) => {
					// fuck off
					console.log('** 195 pass no match\n', e);
					res.send({ success: false, msg: 'User not found' });
			});
	} else {
			console.log('nEnd of the Line');
			res.redirect('/');
	}
});
router.post('/register', (req, res, next) => {
	console.log("\n ** ** ** ** ** ** MESSAGE RECIEVED ** ** ** ** ** ** * \n", req.body, '\n');
	if (req.body.register) {
			console.log('REGISTER');
			let new_user = {
					username: req.body.username.trim().toUpperCase(),
					name: req.body.name.trim().toUpperCase(),
					surname: req.body.surname.trim().toUpperCase(),
					email: req.body.email.trim().split(' ').join(''),
					cell_1: req.body.cell1.trim().split(' ').join(''),
					cell_2: req.body.cell2.trim().split(' ').join(''),
					password: req.body.password,
					active: true,
					rights: '[]'
			};
			new_user.password = 'ZZzz!!11';
			req.body.confirmPassword = 'ZZzz!!11';
			console.log('*0 username ', !check_name(new_user.username),new_user.username );
			console.log('*1 name ', !check_name(new_user.name),new_user.name );
			console.log('*2 surname ', !check_name(new_user.surname),new_user.surname );
			console.log('3 email ', !check_email(new_user.email) );
			// console.log('4 cell_1 ', !check_tel(new_user.cell_1) );
			// console.log('5 cell_2 ', !check_tel(new_user.cell_2) );
			console.log('*6 password ', !check_psswd(new_user.password), new_user.password);
			console.log('*7 Match  ', new_user.password !== req.body.confirmPassword, new_user.password ,req.body.confirmPassword);
			
			// !check_tel(new_user.cell_2) || 
			// !check_tel(new_user.cell_1) || 
			// !check_email(new_user.email) || 
			if (
						!check_name(new_user.username) || 
						!check_name(new_user.name) || 
						!check_name(new_user.surname) || 
						!check_psswd(new_user.password) ||
						new_user.password != req.body.confirmPassword
					) {
					// fucken credentials
					console.log('**   credentials failed');
					res.send({ success: false, msg: 'missing information' });
			} else {
					fn_findUser(new_user).then(user => {
							res.send({ sucess: false, msg: `'<b>${user}</b>' already in use` });
					}).catch(e => {
							fn_register(new_user).then(registered => {
									console.log('**\t98registerd: ' + registered);
									// successfully registered
									res.send({ success: true, msg: 'Username or password invalid' });
							}).catch(e => {
									// registration falied
									res.send({ success: false, msg: 'Error registering user' });
							});
					});
			}
	} else {
			console.log('nEnd of the Line');
			res.redirect('/');
	}
});
router.post('/remove', (req, res, next) => {
	console.log("\n ** ** ** ** ** ** MESSAGE RECIEVED ** ** ** ** ** ** * \n", req.body, '\n');
	if (req.body.remove) {
		const id = req.body.id;
		findAdminById(id).then(admin => {
			// Todo: check if user is not removing them-self
			console.log('\t Remove admin ', admin);
			// active = oposite of curents users status 
			const active = admin.active ? false: true; 
			removeUser(id, active).then(success => {
				console.log('remove admin ', success);
				res.send({ success: true, msg: admin.anme + '\'s removed'});
			}).catch(e => res.send({ success: false,msg: e}));
		}).catch(e => res.send({ success: false, msg: e}));
	} else {
			console.log('nEnd of the Line');
			res.redirect('/');
	}
});
router.post('/update', (req, res, next) => {
	console.log("\n ** ** ** ** ** ** MESSAGE RECIEVED ** ** ** ** ** ** * \n", req.body, '\n');
	if (req.body.upadteUser) {
		const id = req.body.id;
		console.log('\tEdit admin ', id);
		findAdminById(id).then(admin => {
			console.log('\tEdit admin ', admin);
			let updateData = {};

			req.body.username ?	updateData.username	= req.body.username	: 0;
			req.body.name ? 		updateData.name 		= req.body.name			: 0;
			req.body.surname ?	updateData.surname	= req.body.surname	: 0;
			req.body.email ?		updateData.email		= req.body.email		: 0;
			req.body.cell1 ?		updateData.cell_1		= req.body.cell1		: 0;
			req.body.cell2 ?		updateData.cell_2		= req.body.cell2		: 0;
			req.body.rights ? 	updateData.rights 	= req.body.rights		: 0;
			/**
			 * might need indepenfdent function
			 * todo: password change
			 * todo: forgot password
			 *  */
			req.body.password ? updateData.password = req.body.password	: 0;

			console.log('updateData ', updateData);
			editAdmin(id, updateData).then(success => {
				console.log('\nedit admin ', success);
				res.send({ success: true, msg: admin.anme + '\'s details changed'});
			}).catch(e => res.send({ success: false,msg: 'Error changing user details'}))
		}).catch(e => res.send({ success: false, msg: e}));
	} else {
			console.log('nEnd of the Line');
			res.redirect('/');
	}
});

module.exports = router;
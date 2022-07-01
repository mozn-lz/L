const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const rounds = 10;

const { db_read, db_create } = require('./db_helper');
const { check_email, check_tel, check_name, check_psswd } = require('./credential_validator');

const table = 'admin';

router.get('/admin', function(req, res, next) {
		res.render('new_admin', { user: req.session.user, title: 'Register', page: 'Register', role: '' });
});
router.get('/login', function(req, res, next) {
		res.render('login', { user: req.session.user, title: 'Login', page: 'Login', role: '' });
});
router.get('/register', function(req, res, next) {
	db_read('users', {email: 'moeketsane.sefako@gmail.com'}, (err, user) => {
		db_read('members', {policy_holder: user[0]._id}, (err, members) => {
			res.render('register', { user: user[0], members, title: 'Register', page: 'Register', role: '' });
		});
	})
});

let fn_register = (user) => {
		console.log('**   fn_register **');
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
					if (cellUser[0]) {
						resolve(cellUser);
					} else if (cellUser1[0]) {
						resolve(cellUser1);
					} else if (emailUser[0]) {
						resolve(emailUser);
					} else {
						reject(false);
					}
				});
			});
		});
	});
}


router.post('/users', (req, res, next) => {
		console.log("\n ** ** ** ** ** ** MESSAGE RECIEVED ** ** ** ** ** ** * \n", req.body, '\n');
		if (req.body.register) {
				console.log('REGISTER');
				let new_user = {
						name: req.body.name.trim(),
						surname: req.body.surname.trim(),
						email: req.body.email.trim().split(' ').join(''),
						cell_1: req.body.cell1.trim().split(' ').join(''),
						cell_2: req.body.cell2.trim().split(' ').join(''),
						password: req.body.password
				};

				console.log('1 name ', !check_name(new_user.name) );
				console.log('2 surname ', !check_name(new_user.surname) );
				console.log('3 email ', !check_email(new_user.email) );
				// console.log('4 cell_1 ', !check_tel(new_user.cell_1) );
				// console.log('5 cell_2 ', !check_tel(new_user.cell_2) );
				console.log('6 password ', !check_psswd(new_user.password));
				console.log('7 Match  ', new_user.password !== req.body.confirmPassword);
				
				// !check_tel(new_user.cell_2) || 
				// !check_tel(new_user.cell_1) || 
				if (
							!check_name(new_user.name) || 
							!check_name(new_user.surname) || 
							!check_email(new_user.email) || 
							!check_psswd(new_user.password) ||
							new_user.password != req.body.confirmPassword
						) {
						// fucken credentials
						console.log('**   credentials failed');
						res.send({ success: false, msg: 'missing information' });
				} else {
						fn_findUser(new_user).then(user => {
								res.send({ sucess: false, msg: 'Email or Cell no. already in use' });
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
		} else if (req.body.upadteUser) {

		} else if (req.body.login) {
			console.log('LOGIN');
				const user = {
						cell_1: req.body.cell,
						cell_2: req.body.cell,
						email: req.body.cell,
						password: req.body.password
				};
				fn_findUser(user).then(db_user => {
						bcrypt.compare(user.password, db_user[0].password, function(err, passwordMatch) {
								console.log('PM: ', passwordMatch);
								if (err || !passwordMatch) {
										// password isfucked
										console.log('** 1. password isfucked');
										res.send({ success: false, msg: 'User password missmatch' });
								} else {
										// successfully loggedin
										console.log('** lets login');
										req.session.user = {};
										req.session.user.email = db_user[0].email;
										req.session.user.cell = db_user[0].cell;
										req.session.user.name = db_user[0].name;
										req.session.user = db_user[0];

										// re-fucken-spond
										res.send({ success: true, msg: 'logged in successfully', id: db_user[0].id });
								}
						});
				}).catch((e) => {
						// fuck off
						console.log('** pass no match\n', e);
						res.send({ success: false, msg: 'User not found' });
				});
		} else {
				console.log('nEnd of the Line');
				res.redirect('/');
		}
});

module.exports = router;
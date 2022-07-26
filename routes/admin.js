// const express = require('express')
const router  = require('express').Router();
const { db_read, db_create, db_update } = require('./db_helper');
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

let removeAdmin = (_id, active) => {
	return new Promise((res, rej) => {
		db_update(table, {_id}, {active}, (err, data) => {
			console.log('\n update admin ', err, data);
			err ? rej(err): res(data);
		});
	});
}
let editAdmin = (id, userEdit) => {
	return new Promise((res, rej) => {
		db_update(table, {_id}, userEdit, (err, data) => {
			console.log('\n edit admin ', err, data);
			err ? rej(err): res(data);
		});
	});
}
let createAdmin = (newAdmin) => {
	// new admin
	return new Promise((res, rej) => {
		db_create(table, newAdmin, (err, data) => {
			console.log('\n create admin ', err, data);
			err ? rej(err) : res(data);
		});
	});
}
// edit user
router.post('/edit-admin', (req, res) => {
	const id = req.body.id;
	const operation = req.body.operation;
	const adminUser = findAdminById(id);

	if (operation == 'create') {
		console.log('create');
		let newUser = {};

		newUser.name			=  req.body.name;
		newUser.surname		=  req.body.surname;
		newUser.password	=  req.body.password;
		newUser.active		=  true;
		newUser.rights		=  [];
		req.body.username ? newUser.username = req.body.username 	: newUser.username = '',
		req.body.cell1 ? 		newUser.cell_1 	 = req.body.cell1			: newUser.cell_1 = '',
		req.body.cell2 ? 		newUser.cell_2 	 = req.body.cell2			: newUser.cell_2 = '';
		req.body.email ? 		newUser.email  	 = req.body.email			: newUser.email = '';

		createAdmin(newUser).then(success => {
			console.log('\nnew admin ', success);
			res.send({data: success, msg: admin.anme + '\'s details changed'});
		}).catch(e => res.send({ success: false,msg: e}));
	} else 
	if (operation == 'edit') {
		adminUser.then(admin => {
			console.log('\tEdit admin ', admin);
			let updateData = {};

			req.body.username ?	updateData.username	= req.body.username	: 0;
			req.body.name ? 		updateData.name 		= req.body.name			: 0;
			req.body.surname ?	updateData.surname	= req.body.surname	: 0;
			req.body.email ?		updateData.email		= req.body.email		: 0;
			req.body.cell_1 ?		updateData.cell1		= req.body.cell_1		: 0;
			req.body.cell_2 ?		updateData.cell2		= req.body.cell_2		: 0;
			req.body.rights ? 	updateData.rights 	= req.body.rights		: 0;
			/**
			 * might need indepenfdent function
			 * todo: password change
			 * todo: forgot password
			 *  */
			req.body.password ? updateData.password = req.body.password	: 0;

			editAdmin(id, updateData).then(success => {
				console.log('\nedit admin ', success);
				res.send({data: success, msg: admin.anme + '\'s details changed'});
			}).catch(e => res.send({ success: false,msg: 'Error changing user details'}))
		}).catch(e => res.send({ success: false, msg: e}));
	} else 
	if (operation == 'remove') {
		adminUser.then(admin => {
			// Todo: check if user is not removing them-self
			console.log('\t Remove admin ', admin);
			// active = oposite of curents users status 
			const active = admin.active ? false: true; 
			removeAdmin(id, active).then(success => {
				console.log('remove admin ', success);
				res.send({data: success, msg: admin.anme + '\'s removed'});
			}).catch(e => res.send({ success: false,msg: e}));
		}).catch(e => res.send({ success: false, msg: e}));
	} else {
		res.send({ success: false,msg: 'No dice'})
	}
});

// admin Rights && Authority
router.get('/user-rights', (req, res) => {
	db_read(table, '', (err, users) => {
		console.log(users);
		res.render('new_admin', {users});
	});
});
module.exports = router;
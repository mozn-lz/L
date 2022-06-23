
const express = require("express");
const { db_create, db_update } = require("./db_helper");
const router = express.Router();

function selectPolicy(userp) {
	let policy = null;
	switch (userp) {
		case 'op1': policy = 'op1'; break;
		case 'op2': policy = 'op2'; break;
		case 'op3': policy = 'op3'; break;
		case 'op4': policy = 'op4'; break;
		case 'fp1': policy = 'fp1'; break;
		case 'fp2': policy = 'fp2'; break;
		case 'fp3': policy = 'fp3'; break;
		case 'fp4': policy = 'fp4'; break;
		case 'pntU65-1': policy = 'pntU65-1'; break;
		case 'pntU65-2': policy = 'pntU65-2'; break;
		case 'pntU65-3': policy = 'pntU65-3'; break;
		case 'pntU65-4': policy = 'pntU65-4'; break;
		case 'pntO65-1': policy = 'pntO65-1'; break;
		case 'pntO65-2': policy = 'pntO65-2'; break;
		case 'pntO65-3': policy = 'pntO65-3'; break;
		case 'pntO65-4': policy = 'pntO65-4'; break;
		case 'xf1': policy = 'xf1'; break;
		case 'xf2': policy = 'xf2'; break;
		case 'xf3': policy = 'xf3'; break;
		case 'xf4': policy = 'xf4'; break;
		case 'rep1': policy = 'rep1'; break;
		case 'rep2': policy = 'rep2'; break;
		case 'rep3': policy = 'rep3'; break;
		case 'rep4': policy = 'rep4'; break;
		case 'repSp1': policy = 'repSp1'; break;
		case 'repSp2': policy = 'repSp2'; break;
		case 'repSp3': policy = 'repSp3'; break;
		case 'repSp4': policy = 'repSp4'; break;

		default:
			policy = null;
			break;
	}
	console.log(`Policy ${policy}`);
	return policy;
}

router.post('/register', (req, res, next) => {
	console.log('** REGISTER **\n', req.body);
	(req.body.idintityForm) ? console.log('** 42 idintityForm **'): console.log('** NOOOOOOOOO **');
	if (req.body.tmp_reg_id) {
		const _id = req.body.tmp_reg_id;
		console.log('** id found ** :\t', _id);
		if (req.body.policyForm) {
			console.log('** policyForm **');
			const policy = selectPolicy(req.body.policy);
			if (policy) {
				console.log('policy found');
				db_update('users', { _id }, { policy }, () => {
					const policy_obj = {
						name: 'Family Cover (max. 5 children)',
						members: 5,
						price: 20,
						Repatriation: {
							Repatriation: true,
							price: 20
						}
					};
					res.send({ success: true, data: {policy: policy_obj}, meg: 'Policy updated' });
				});
			} else {
				console.log('No policy');
				res.send({ success: false, meg: 'Selected policy seams invalid' });
			}
		} else if (req.body.beneficiaryForm) {
			if (req.body.benficiary) {
				const beneficiary = req.body.benficiary;
				// find user in dependents table
				db_read(beneficiaryTb, {id: beneficiary}, benef => {
					if (!benef) {
						res.send({success: false, msg: 'Beneficiary Set'});
					} else {
						// set user as beneficiary
						db_update('users', {_id: req.body.id}, {beneficiary}, data => {
							(data) ? 
							res.send({success: true, msg: 'Beneficiary Set'}):
							res.send({success: false, msg: 'Beneficiary Set'});
						});
					}
				});
			}
		} else if (req.body.addPersonsForm) { 
			const personTitle = req.body.personTitle;
			const surname = req.body.surname;
			const first = req.body.first;
			const initials = req.body.initials;
			const relationship = req.body.relationship;
			const date = req.body.date;
			const phone = req.body.phone;
			if (personTitle && surname && first && initials && relationship && date && phone) {
				const new_beneficiary = {
					personTitle,
					surname,
					first,
					initials,
					relationship,
					date,
					phone 
				};
				db_create('users',new_beneficiary, data => {
					console.log('Persons from: ', data);
					res.send({success: true, data, msg: 'User saved'});
				});
			} else {
				res.send('Missing/Invalid information');
			}
		} else {
			res.status(404);
		}
	} else
	if (req.body.idintityForm) {
		console.log('0__');
		console.log(`title: ${req.body.title}`);
		console.log(`name: ${req.body.name}`);
		console.log(`surname: ${req.body.surname}`);
		console.log(`altsurname: ${req.body.altsurname}`);
		console.log(`nat_id: ${req.body.nat_id}`);
		console.log(`birth: ${req.body.birth}`);
		console.log(`gender: ${req.body.gender}`);
		console.log(`address: ${req.body.address}`);
		console.log(`status: ${req.body.status}`);
		console.log(`email: ${req.body.email}`);
		console.log(`cell1: ${req.body.cell1}`);
		console.log(`cell2: ${req.body.cell2}`);
		console.log('** idintityForm **')
		let new_user = {};

		console.log('0');
		req.body.altsurname ? new_user.alt_Surname 	= req.body.altsurname		: new_user.alt_Surname	= '';
		req.body.title 			? new_user.title 				= req.body.title				: new_user.title				= '';
		req.body.name 			? new_user.name 				= req.body.name					: new_user.name					= '';
		req.body.surname 		? new_user.surname 			= req.body.surname			: new_user.surname			= '';
		req.body.nat_id 		? new_user.national_id 	= req.body.nat_id				: new_user.national_id	= '';
		req.body.birth 			? new_user.birth 				= req.body.birth				: new_user.birth				= '';
		req.body.gender 		? new_user.gender 			= req.body.gender				: new_user.gender				= '';
		req.body.address		? new_user.address 			= req.body.address			: new_user.address			= '';
		req.body.status			? new_user.status 			= req.body.status				: new_user.status				= '';
		req.body.email 			? new_user.email 				= req.body.email				: new_user.email				= '';
		req.body.cell1 			? new_user.cell_1 			= req.body.cell1				: new_user.cell_1				= '';
		req.body.cell2 			? new_user.cell_2 			= req.body.cell2				: new_user.cell_2				= '';
		console.log('1');
		(req.body.title == 'mrs' ||
		req.body.title == 'ms' ||
		req.body.title == 'mr') ? new_user.title = req.body.title		: 0;
		console.log('2');
		(req.body.gender == 'm' ||
		req.body.gender == 'f') ? new_user.gender = req.body.gender: 0;
		console.log('3');
		(req.body.status == "single" ||
		req.body.status == "married" ||
		req.body.status == "widow" ||
		req.body.status == "separated" ||
		req.body.status == "civil") ? new_user.status = req.body.status: 0;

		console.log('user:', new_user);
		db_create('users', new_user, data => {
			console.log('New User > \n\t\tdata: ', data);
			data ?
			res.send({success: true, data, msg: 'User regidered'}):
			res.send({success: false, msg: 'Error registering user'});
		});
	}
	else {
		console.log('no err');
		res.status(404);
	}
});

module.exports = router


const express = require("express");
const { db_create, db_update, db_read } = require("./db_helper");
const router = express.Router();

function selectPolicy(userp) {
	let policy = null;
	switch (userp) {
		case 'op1': policy = { members:2, code:'op1'}; break;
		case 'op2': policy = { members:2, code:'op2'}; break;
		case 'op3': policy = { members:2, code:'op3'}; break;
		case 'op4': policy = { members:2, code:'op4'}; break;
		case 'fp1': policy = { members:2, code:'fp1'}; break;
		case 'fp2': policy = { members:2, code:'fp2'}; break;
		case 'fp3': policy = { members:2, code:'fp3'}; break;
		case 'fp4': policy = { members:2, code:'fp4'}; break;
		case 'pntU65_1': policy = { members:2, code:'pntU65_1'}; break;
		case 'pntU65_2': policy = { members:2, code:'pntU65_2'}; break;
		case 'pntU65_3': policy = { members:2, code:'pntU65_3'}; break;
		case 'pntU65_4': policy = { members:2, code:'pntU65_4'}; break;
		case 'pntO65_1': policy = { members:2, code:'pntO65_1'}; break;
		case 'pntO65_2': policy = { members:2, code:'pntO65_2'}; break;
		case 'pntO65_3': policy = { members:2, code:'pntO65_3'}; break;
		case 'pntO65_4': policy = { members:2, code:'pntO65_4'}; break;
		case 'xf1': policy = { members:2, code:'xf1'}; break;
		case 'xf2': policy = { members:2, code:'xf2'}; break;
		case 'xf3': policy = { members:2, code:'xf3'}; break;
		case 'xf4': policy = { members:2, code:'xf4'}; break;
		case 'rep1': policy = { members:2, code:'rep1'}; break;
		case 'rep2': policy = { members:2, code:'rep2'}; break;
		case 'rep3': policy = { members:2, code:'rep3'}; break;
		case 'rep4': policy = { members:2, code:'rep4'}; break;
		case 'repSp1': policy = { members:2, code:'repSp1'}; break;
		case 'repSp2': policy = { members:2, code:'repSp2'}; break;
		case 'repSp3': policy = { members:2, code:'repSp3'}; break;
		case 'repSp4': policy = { members:2, code:'repSp4'}; break;

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
		} else if (req.body.addMemberForm) {
			console.log('\n\n** Menmber form **)\n', req.body); 
			const new_member = {
				title: req.body.memberTitle,
				name: req.body.memberName,
				surname: req.body.memberSurname,
				initials: req.body.memberInitials,
				birth: req.body.memberBirth,
				relationship: req.body.relationship,
				phone: req.body.phone,
				policy_holder: req.body.tmp_reg_id 
			};
			if (new_member.title && new_member.name && new_member.surname && new_member.initials && 
					new_member.birth && new_member.relationship && new_member.phone && new_member.policy_holder) {

				// console.log('ner Member: ', new_member);

				db_read('users', {_id: new_member.policy_holder}, user => {
					if (!user) {
						res.send({success: false, msg: 'Cannot find policy'});
					} else {
						user = user[0];
						user.members = JSON.parse(user.members);

						db_create('members',new_member, data => {
							if (!data) {
								res.send({success: false, msg: 'Cannot find policy'});
							} else {
								let members = JSON.stringify([...user.members, data]);
								db_update('users', {_id: new_member.policy_holder}, {members}, doc => {
									doc.changedRows ?
									res.send({success: true, data, msg: 'User saved'}):
									res.send({success: false, msg: 'could not save new policy member'});
								});
							}
						});
					}
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
		req.body.name 			? new_user.name 				= req.body.name					: new_user.name					= '';
		req.body.surname 		? new_user.surname 			= req.body.surname			: new_user.surname			= '';
		req.body.nat_id 		? new_user.national_id 	= req.body.nat_id				: new_user.national_id	= '';
		req.body.birth 			? new_user.birth 				= req.body.birth				: new_user.birth				= '';
		req.body.address		? new_user.address 			= req.body.address			: new_user.address			= '';
		req.body.email 			? new_user.email 				= req.body.email				: new_user.email				= '';
		req.body.cell1 			? new_user.cell_1 			= req.body.cell1				: new_user.cell_1				= '';
		req.body.cell2 			? new_user.cell_2 			= req.body.cell2				: new_user.cell_2				= '';

		new_user.policy				= '',
		new_user.beneficiary	= '',
		new_user.members			= '[]',
		new_user.payments			= '[]',

		console.log('1');
		(req.body.title == 'mrs' ||
		req.body.title == 'ms' ||
		req.body.title == 'mr') ? new_user.title = req.body.title		: new_user.title = '';
		console.log('2');
		(req.body.gender == 'm' ||
		req.body.gender == 'f') ? new_user.gender = req.body.gender: new_user.gender = '';
		console.log('3');
		(req.body.status == "single" ||
		req.body.status == "married" ||
		req.body.status == "widow" ||
		req.body.status == "separated" ||
		req.body.status == "civil") ? new_user.status = req.body.status: new_user.status = '';

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

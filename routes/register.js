
const express = require("express");
const { db_create, db_update, db_read, db_delete } = require("./db_helper");
const router = express.Router();

function selectPolicy(userp) {
	let policy = null;
	switch (userp) {
		case 'op1': policy = { name:'individual1',members:1, code:'op1'}; break;
		case 'op2': policy = { name:'individual2',members:1, code:'op2'}; break;
		case 'op3': policy = { name:'individual3',members:1, code:'op3'}; break;
		case 'op4': policy = { name:'individual4',members:1, code:'op4'}; break;
		case 'fp1': policy = { name:'family1',members:8, code:'fp1'}; break;
		case 'fp2': policy = { name:'family2',members:8, code:'fp2'}; break;
		case 'fp3': policy = { name:'family3',members:8, code:'fp3'}; break;
		case 'fp4': policy = { name:'family4',members:8, code:'fp4'}; break;
		case 'pntU65_1': policy = { name:'parent Under 65_1',members:6, code:'pntU65_1'}; break;
		case 'pntU65_2': policy = { name:'parent Under 65_2',members:6, code:'pntU65_2'}; break;
		case 'pntU65_3': policy = { name:'parent Under 65_3',members:6, code:'pntU65_3'}; break;
		case 'pntU65_4': policy = { name:'parent Under 65_4',members:6, code:'pntU65_4'}; break;
		case 'pntO65_1': policy = { name:'parent Over 65_1',members:6, code:'pntO65_1'}; break;
		case 'pntO65_2': policy = { name:'parent Over 65_2',members:6, code:'pntO65_2'}; break;
		case 'pntO65_3': policy = { name:'parent Over 65_3',members:6, code:'pntO65_3'}; break;
		case 'pntO65_4': policy = { name:'parent Over 65_4',members:6, code:'pntO65_4'}; break;
		case 'xf1': policy = { name:'extended family1',members:6, code:'xf1'}; break;
		case 'xf2': policy = { name:'extended family2',members:6, code:'xf2'}; break;
		case 'xf3': policy = { name:'extended family3',members:6, code:'xf3'}; break;
		case 'xf4': policy = { name:'extended family4',members:6, code:'xf4'}; break;
		case 'rep1': policy = { name:'repatriation members only 1',members:2, code:'rep1'}; break;
		case 'rep2': policy = { name:'repatriation members only 2',members:2, code:'rep2'}; break;
		case 'rep3': policy = { name:'repatriation members only 3',members:2, code:'rep3'}; break;
		case 'rep4': policy = { name:'repatriation members only 4',members:2, code:'rep4'}; break;
		case 'repSp1': policy = { name:'repatriation inc spouse  1',members:2, code:'repSp1'}; break;
		case 'repSp2': policy = { name:'repatriation inc spouse  2',members:2, code:'repSp2'}; break;
		case 'repSp3': policy = { name:'repatriation inc spouse  3',members:2, code:'repSp3'}; break;
		case 'repSp4': policy = { name:'repatriation inc spouse  4',members:2, code:'repSp4'}; break;

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
				db_update('users', { _id }, { policy }, (err, data) => {
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
				db_read(beneficiaryTb, {id: beneficiary}, (err, benef) => {
					if (!benef) {
						res.send({success: false, msg: 'Beneficiary Set'});
					} else {
						// set user as beneficiary
						db_update('users', {_id: req.body.id}, {beneficiary}, (err, data) => {
							(data) ? 
							res.send({success: true, msg: 'Beneficiary Set'}):
							res.send({success: false, msg: 'Beneficiary Set'});
						});
					}
				});
			}
		} else if (req.body.addMemberForm) {
			console.log('\n\n** Menmber form **)\n', req.body); 
			const new_member = {};
			req.body.memberTitle		? new_member.title					= req.body.memberTitle.toUpperCase()		:new_member.title = null;
			req.body.memberName			? new_member.name						= req.body.memberName.toUpperCase()			:new_member.name = null;
			req.body.memberSurname	? new_member.surname				= req.body.memberSurname.toUpperCase()	:new_member.surname = null;
			req.body.memberInitials	? new_member.initials				= req.body.memberInitials.toUpperCase()	:new_member.initials = null;
			req.body.memberBirth		? new_member.birth					= req.body.memberBirth		:new_member.birth = null;
			req.body.relationship		? new_member.relationship		= req.body.relationship		:new_member.relationship = null;
			req.body.phone					? new_member.phone					= req.body.phone					:new_member.phone = null;
			req.body.tmp_reg_id			? new_member.policy_holder	= req.body.tmp_reg_id 		:new_member.policy_holder = null;

			if (new_member.title && new_member.name && new_member.surname && new_member.initials && 
					new_member.birth && new_member.relationship && new_member.phone && new_member.policy_holder) {

				// console.log('ner Member: ', new_member);

				db_read('users', {_id: new_member.policy_holder}, (err, user) => {
					if (!user) {
						res.send({success: false, msg: 'Cannot find policy'});
					} else {
						user = user[0];
						user.members = JSON.parse(user.members);

						db_create('members',new_member, (err, data) => {
							if (!data) {
								res.send({success: false, msg: 'Cannot find policy'});
							} else {
								let members = JSON.stringify([...user.members, data]);
								db_read('members', {policy_holder: new_member.policy_holder}, (err, members) => {
									members ?
									res.send({success: true, data: members, msg: 'User saved'}):
									res.send({success: false, msg: 'could not save new policy member'});
								});
							}
						});
					}
				});
			} else {
				res.send('Missing/Invalid information');
			}
		} 
		else if (req.body.editMember || req.body.deleteMember) {
			let _id = req.user.memberId;
			db_read('members', {_id}, (err, user) => {
				if (!user[0].name) {res.send({success: false})} else {
					if (req.body.editMember) {
						let edituser = {};
						req.body.memberTitle ? 		edituser.title 					= req.body.memberTitle.toUpperCase()		: edituser.title = null;
						req.body.memberName ? 		edituser.name 					= req.body.memberName.toUpperCase()			: edituser.name = null;
						req.body.memberSurname ? 	edituser.surname 				= req.body.memberSurname.toUpperCase()	: edituser.surname = null;
						req.body.memberInitials ? edituser.initials 			= req.body.memberInitials.toUpperCase()	: edituser.initials = null;
						req.body.memberBirth ? 		edituser.birth 					= req.body.memberBirth	: edituser.birth = null;
						req.body.relationship ? 	edituser.relationship 	= req.body.relationship	: edituser.relationship = null;
						req.body.phone ? 					edituser.phone 					= req.body.phone				: edituser.phone = null;
						req.body.tmp_reg_id ? 		edituser.policy_holder 	= req.body.tmp_reg_id		: edituser.policy_holder = null;
						db_update('members', {_id, policy_holder: req.body.tmp_reg_id}, edituser, (err, data) => {
							data ? res.send({success: true}):res.send({success: false}); 
						});
					} else if (req.body.deleteMember) {
						// delete !update
						db_delete('members', {_id, policy_holder: req.body.tmp_reg_id}, (err, doc) => {
							res.send({success: true}); 
						});
					} else {
						res.send({ success: false });
					}
				}
			});
		}
		else {
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
		req.body.altsurname ? new_user.alt_Surname 	= req.body.altsurname.toUpperCase()		: new_user.alt_Surname	= null;
		req.body.name 			? new_user.name 				= req.body.name.toUpperCase()					: new_user.name					= null;
		req.body.surname 		? new_user.surname 			= req.body.surname.toUpperCase()			: new_user.surname			= null;
		req.body.address		? new_user.address 			= req.body.address.toUpperCase()			: new_user.address			= null;
		req.body.nat_id 		? new_user.national_id 	= req.body.nat_id				: new_user.national_id	= null;
		req.body.birth 			? new_user.birth 				= req.body.birth				: new_user.birth				= null;
		req.body.email 			? new_user.email 				= req.body.email				: new_user.email				= null;
		req.body.cell1 			? new_user.cell_1 			= req.body.cell1				: new_user.cell_1				= null;
		req.body.cell2 			? new_user.cell_2 			= req.body.cell2				: new_user.cell_2				= null;

		new_user.policy					= '',
		new_user.beneficiary		= '',
		new_user.members				= '[]',
		new_user.policy_payment	= 0,

		console.log('1');
		(req.body.title == 'mrs' ||
		req.body.title == 'ms' ||
		req.body.title == 'mr') ? new_user.title = req.body.title.toUpperCase()		: new_user.title = null;
		console.log('2');
		(req.body.gender == 'm' ||
		req.body.gender == 'f') ? new_user.gender = req.body.gender.toUpperCase(): new_user.gender = null;
		console.log('3');
		(req.body.status == "single" ||
		req.body.status == "married" ||
		req.body.status == "widow" ||
		req.body.status == "separated" ||
		req.body.status == "civil") ? new_user.status = req.body.status: new_user.status = null;

		if (!new_user.title || !new_user.name || !new_user.surname || 
			!new_user.nat_id || !new_user.birth || !new_user.gender || !new_user.address || 
			!new_user.status || !new_user.email || !new_user.cell_1 || !new_user.cell_2) {
			res.status(404);
		} else {
			console.log('user:', new_user);
			db_create('users', new_user, (err, data) => {
				console.log('New User > \n\t\tdata: ', data);
				data ?
				res.send({success: true, data, msg: 'User regidered'}):
				res.send({success: false, msg: 'Error registering user'});
			});
		}
	}
	else {
		console.log('no err');
		res.status(404);
	}
});

module.exports = router

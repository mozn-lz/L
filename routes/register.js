
const express = require("express");
const { authUser, authClents } = require("./auth");
const { db_create, db_update, db_read, db_delete } = require("./db_helper");
const { findUserById, gen_db_read } = require("./gen_helper");
const router = express.Router();

let selectPolicy = (findPolicy) => {
	console.log('select Policy ', findPolicy);
	return new Promise((res, rej) => {
		switch (findPolicy) {
			case 'op1': res('op1');
			case 'op2': res('op2');
			case 'op3': res('op3');
			case 'op4': res('op4');
			case 'fp1': res('fp1');
			case 'fp2': res('fp2');
			case 'fp3': res('fp3');
			case 'fp4': res('fp4');
			case 'pntU65_1': res('pntU65_1');
			case 'pntU65_2': res('pntU65_2');
			case 'pntU65_3': res('pntU65_3');
			case 'pntU65_4': res('pntU65_4');
			case 'pntO65_1': res('pntO65_1');
			case 'pntO65_2': res('pntO65_2');
			case 'pntO65_3': res('pntO65_3');
			case 'pntO65_4': res('pntO65_4');
			case 'xf1': res('xf1');
			case 'xf2': res('xf2');
			case 'xf3': res('xf3');
			case 'xf4': res('xf4');
			case 'rep1': res('rep1');
			case 'rep2': res('rep2');
			case 'rep3': res('rep3');
			case 'rep4': res('rep4');
			case 'repSp1': res('repSp1');
			case 'repSp2': res('repSp2');
			case 'repSp3': res('repSp3');
			case 'repSp4': res('repSp4');
	
			default: rej(null);
		}
	});
}

let validatePolicy = (policies => {
	const policyArr = Object.values(policies);
	const maxArray  = policyArr.length - 2;
	let policys = [];

	return new Promise((res, rej) => {
		for (let i = 0; i < maxArray; i++) {
			const findPolicy = policyArr[i];
			const err = `Policy code: "${findPolicy}" is invalid`
			selectPolicy(findPolicy).then(validPolicy => {
				!validPolicy ? rej(err) : policys.push(validPolicy);
				i+1 == maxArray ? res(JSON.stringify(policys)) : 0;
			}).catch(e => rej(err));
		}
	});
});

// new policy holders
router.get('/register', authUser, authClents.create(), function(req, res, next) {
	res.render('register', { user: req.session.user, polyicyHldr: null, members: null , title: 'Register', page: 'Register', role: '' });
});

// edit policies
router.get('/register/:id', authUser, authClents.update(), function(req, res, next) {
	const _id = req.params.id;

	Promise.all([findUserById(_id), gen_db_read('members', { policy_holder: _id })])
	.then ((data) => {
		const polyicyHldr = data[0];
		const members = data[1];
		polyicyHldr.policy = JSON.parse(polyicyHldr.policy);
		console.log(polyicyHldr);
		console.log('members ', typeof(members), Array.isArray(members), members);
		console.table(members)
		console.table(members[0])
		res.render('register', { user: req.session.user, polyicyHldr, members, title: 'Register', page: 'Register', role: '' });
	}).catch(e => res.redirect('/'))
});

router.post('/register', authUser, authClents.create(), (req, res, next) => {
	console.log('** REGISTER **\n', req.body);
	(req.body.idintityForm) ? console.log('** 42 idintityForm **'): console.log('** NOOOOOOOOO **');
	if (req.body.tmp_reg_id) {
		const _id = req.body.tmp_reg_id;
		console.log('** id found ** :\t', _id);
		if (req.body.policyForm) {
			console.log('** policyForm **');
			validatePolicy(req.body).then(policy => {
				if (policy) {
					console.log('policy found', policy);
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
					res.send({ success: false, meg: 'No policies found' });
				}
			}).catch(e => { res.send({success: false, msg: 'Policy retreval issue'})})
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
			let new_member = {};
			req.body.memberTitle		? new_member.title					= req.body.memberTitle.toUpperCase()		:new_member.title = null;
			req.body.memberName			? new_member.name						= req.body.memberName.toUpperCase()			:new_member.name = null;
			req.body.memberSurname	? new_member.surname				= req.body.memberSurname.toUpperCase()	:new_member.surname = null;
			req.body.memberInitials	? new_member.initials				= req.body.memberInitials.toUpperCase()	:new_member.initials = null;
			req.body.memberBirth		? new_member.birth					= req.body.memberBirth		:new_member.birth = null;
			req.body.relationship		? new_member.relationship		= req.body.relationship		:new_member.relationship = null;
			req.body.phone					? new_member.phone					= req.body.phone					:new_member.phone = null;
			req.body.policy					? new_member.policy					= req.body.policy					:new_member.policy = null;
			req.body.tmp_reg_id			? new_member.policy_holder	= req.body.tmp_reg_id 		:new_member.policy_holder = null;

			if (new_member.title && new_member.name && new_member.surname && new_member.initials && new_member.policy &&
					new_member.birth && new_member.relationship && new_member.phone && new_member.policy_holder) {

				// console.log('ner Member: ', new_member);

				findUserById(new_member.policy_holder).then(policyHolder => {
					// user.members = JSON.parse(user.members);

					db_create('members',new_member, (err, data) => {
						if (!data) {
							res.send({success: false, msg: 'Cannot find policy'});
						} else {
							db_read('members', {policy_holder: new_member.policy_holder}, (err, members) => {
								members ?
								res.send({success: true, data: members, policy: policyHolder.policy, msg: 'User saved'}):
								res.send({success: false, msg: 'could not save new policy member'});
							});
						}
					});
				}).catch(e => {res.send({success: false, msg: 'Policy holder not found'});});
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
		// res.status(404);
		res.send({ success: false, message: 'Invalid request'});
	}
});
router.post('/update-client', authUser, authClents.update(), (req, res) => {
	console.log('update-client ', req.body);
	if (req.body.idintityForm) {
		const _id = req.body.tmp_reg_id;
		let update_user = {};

		req.body.altsurname ? update_user.alt_Surname 	= req.body.altsurname.toUpperCase()		: 0;
		req.body.name 			? update_user.name 				= req.body.name.toUpperCase()					: 0;
		req.body.surname 		? update_user.surname 			= req.body.surname.toUpperCase()			: 0;
		req.body.address		? update_user.address 			= req.body.address.toUpperCase()			: 0;
		req.body.nat_id 		? update_user.national_id 	= req.body.nat_id				: 0;
		req.body.birth 			? update_user.birth 				= req.body.birth				: 0;
		req.body.email 			? update_user.email 				= req.body.email				: 0;
		req.body.cell1 			? update_user.cell_1 			= req.body.cell1				: 0;
		req.body.cell2 			? update_user.cell_2 			= req.body.cell2				: 0;

		(req.body.title == 'mrs' ||
		req.body.title == 'ms' ||
		req.body.title == 'mr') ? update_user.title = req.body.title.toUpperCase()	: 0;
		(req.body.gender == 'm' ||
		req.body.gender == 'f') ? update_user.gender = req.body.gender.toUpperCase(): 0;
		(req.body.status == "single" ||
		req.body.status == "married" ||
		req.body.status == "widow" ||
		req.body.status == "separated" ||
		req.body.status == "civil") ? update_user.status = req.body.status:0

		console.log('user:', update_user);
		db_update('users', {_id}, update_user, (err, data) => {
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


const express = require("express");
const { authUser, authClents } = require("./auth");
const { db_create, db_update, db_read, db_delete } = require("./db_helper");
const { findUserById, gen_db_read } = require("./gen_helper");
const router = express.Router();

let validatePolicy = (policies => {
	const policyArr = Object.values(policies);
	const maxArray  = policyArr.length-2;
	let policys = [];
	let policyOb = [];

	return new Promise((res, rej) => {
		for (let i = 0; i < maxArray; i++) {
			const findPolicy = policyArr[i];
			const err = `Policy code: "${findPolicy}" is invalid`;

			console.log(findPolicy)
			gen_db_read('policy', {code:findPolicy}).then(validPolicy => {
				validPolicy= validPolicy[0];
				console.log(i, maxArray, `' validPolicy '${validPolicy.premium} `, validPolicy.code);
				!validPolicy ? rej(err) : policys.push(validPolicy.code);
				!validPolicy ? rej(err) : policyOb.push(validPolicy);
				i+1 == maxArray ? res([ (policys), (policyOb) ]) : 0;
			}).catch(e => rej(err));
		}
	});
});

// new policy holders
router.get('/register', authUser, authClents.create(), function(req, res, next) {
	gen_db_read('policy', '').then(policyList => {
		res.render('register', { user: req.session.user, polyicyHldr: null, policyList, members: null , title: 'Register', page: 'Register', role: '' });
	})
	.catch(e => null)
});

// edit policies
router.get('/register/:id', authUser, authClents.update(), function(req, res, next) {
	const _id = req.params.id;

	console.log('register/:id ' + _id);
	Promise.all([findUserById(_id), gen_db_read('members', { policy_holder: _id }), gen_db_read('policy', '')])
	.then ((data) => {
		let polyicyHldr = data[0];
		let members = data[1];
		let policyList = data[2];
		console.log('policies: ', policyList);
		console.log(polyicyHldr, polyicyHldr.policy);
		polyicyHldr.policy ? polyicyHldr.policy = JSON.parse(polyicyHldr.policy): polyicyHldr.policy = [];
		console.log(polyicyHldr);
		console.log('members ', typeof(members), Array.isArray(members), members);
		console.table(members)
		console.table(members[0])
		res.render('register', { user: req.session.user, polyicyHldr, members, policyList, title: 'Register', page: 'Register', role: '' });
	}).catch(e => {console.log(e);res.redirect('/')})
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
					let policy_payment = 0;
					poicyOB = policy[1];
					poicyOB.forEach(ob => { console.log(policy_payment, ob.premium); policy_payment+= Number(ob.premium);  console.log(policy_payment, ob.premium);});

					console.log('policy found', policy);
					db_update('users', { _id }, { policy: JSON.stringify(policy[0]), 	policy_payment }, (err, data) => {
						res.send({ success: true, data: {policy: policy[1]}, meg: 'Policy updated' });
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
			new_member.beneficiary = false;

			if (new_member.title && new_member.name && new_member.surname && new_member.initials && new_member.policy &&
				// new_member.birth && 
				// new_member.relationship && new_member.phone && 
				new_member.policy_holder) {
					
				// console.log('ner Member: ', new_member);

				Promise.all([
					gen_db_read('policy', {code: new_member.policy}), 
					gen_db_read('members', {policy: new_member.policy, policy_holder: new_member.policy_holder}), 
					findUserById(new_member.policy_holder)
				]).then(result => {
					const policy = result[0][0];
					const members = result[1];
					const user = result[2];
					// user.members = JSON.parse(user.members);

					if (policy.memebers < members.length)
					db_create('members',new_member, (err, data) => {
						if (!data) {
							res.send({success: false, msg: 'Cannot find policy'});
						} else {
							db_read('members', {policy_holder: new_member.policy_holder}, (err, members) => {
								members ?
								res.send({success: true, data: members, policy: user.policy, msg: 'User saved'}):
								res.send({success: false, msg: 'could not save new policy member'});
							});
						}
					});
				}).catch(e => {res.send({success: false, msg: 'Policy holder not found'});});
			} else {
				res.send({success: false, msg:'Missing/Invalid information'});
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
		req.body.altsurname ? new_user.alt_Surname 	= req.body.altsurname.trim().toUpperCase()		: new_user.alt_Surname	= '';
		req.body.name 			? new_user.name 				= req.body.name.trim().toUpperCase()					: new_user.name					= null;
		req.body.surname 		? new_user.surname 			= req.body.surname.trim().toUpperCase()				: new_user.surname			= null;
		req.body.address		? new_user.address 			= req.body.address.trim().toUpperCase()				: new_user.address			= null;
		req.body.nat_id 		? new_user.national_id 	= req.body.nat_id.trim()				: new_user.national_id	= null;
		req.body.birth 			? new_user.birth 				= req.body.birth.trim()					: new_user.birth				= null;
		req.body.email 			? new_user.email 				= req.body.email.trim()					: new_user.email				= null;
		req.body.cell1 			? new_user.cell_1 			= req.body.cell1.trim()					: new_user.cell_1				= null;
		req.body.cell2 			? new_user.cell_2 			= req.body.cell2.trim()					: new_user.cell_2				= null;

		new_user.policy					= '',
		new_user.beneficiary		= '',
		new_user.reg_date				= new Date().toDateString();
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

		console.log('4 new_user', new_user);
		if (!new_user.title || !new_user.name || !new_user.surname || 
			!new_user.national_id || !new_user.birth || !new_user.gender || !new_user.address || 
			!new_user.status
			//  || !new_user.email || !new_user.cell_1
			) {
				console.log('F user:');
				console.log('\ntitle ', !(!new_user.title), new_user.title);
				console.log('\nname ', !(!new_user.name), new_user.name );
				console.log('\nsurname ', !(!new_user.surname), new_user.surname  );
				console.log('\nnat_id ', !(!new_user.national_id), new_user.national_id );
				console.log('\nbirth ', !(!new_user.birth), new_user.birth);
				console.log('\ngender ', !(!new_user.gender), new_user.gender );
				console.log('\naddress ', !(!new_user.address), new_user.address );
				console.log('\nstatus ', !(!new_user.status), new_user.status );
				console.log('\nemail ', !(!new_user.email), new_user.email);
				console.log('\ncell_1 ', !(!new_user.cell_1), new_user.cell_1);
				res.send({success: false, msg: 'One or more missing Important fields'});
		} else {
			console.log('S user:', new_user);
			db_create('users', new_user, (err, data) => {
				console.log('New User > \n\t\tdata: ', data);
				data ?
				res.send({success: true, data: data.insertId, msg: 'User registered'}):
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
			res.send({success: true, data, msg: 'User information updataed'}):
			res.send({success: false, msg: 'Error registering user'});
		});
	}
	else {
		console.log('no err');
		res.status(404);
	}
});

module.exports = router

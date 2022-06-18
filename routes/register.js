
const express = require("express");
const { db_create } = require("./db_helper");
const router = express.Router();

router.post('/', (req, res, next) => {
	if (req.body.idintityForm) {
		let new_user;
		
		req.body.name				? new_user.name = req.body.name				: 0;
		req.body.surname		? new_user.surname = req.body.surname	: 0;
		req.body.id					? new_user.id = req.body.id						: 0;
		req.body.birth			? new_user.birth = req.body.birth			: 0;
		req.body.address		? new_user.address = req.body.address	: 0;
		req.body.email			? new_user.email = req.body.email			: 0;
		req.body.cell1 			? new_user.cell1 = req.body.cell1			: 0;
		req.body.altsurname ? new_user.altsurname = req.body.altsurname: 0;
	 
		(req.body.title == 'mrs' ||
		req.body.title == 'ms' ||
		req.body.title == 'mr') ? new_user.title = req.body.title		: 0;
		(req.body.gender == 'm' ||
		req.body.gender == 'f') ? new_user.gender = req.body.gender: 0;
		(req.body.status == "single" ||
		req.body.status == "married" ||
		req.body.status == "widow" ||
		req.body.status == "separated" ||
		req.body.status == "civil") ? new_user.status = req.body.status: 0;

		db_create('users', new_user, data => {
			data ?
			res.send({success: true, data, msg: 'User regidered'}):
			res.send({success: false, msg: 'Error registering user'});
		});
	} else if (req.body.id) {
		if (req.body.policyForm) {
			switch (req.body.policy) {
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
					reject('Invalid option');
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
						db_update(usersTb, {id: req.body.id}, {beneficiary}, data => {
							(data) ? 
							res.send({success: true, msg: 'Beneficiary Set'}):
							res.send({success: false, msg: 'Beneficiary Set'});
						});
					}
				});
			}
		} else if (req.body.personsForm) { 
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
	} else {
		res.status(404);
	}
});
module.exports = router




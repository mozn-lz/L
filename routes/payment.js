const express = require("express");
const router = express.Router();
const { db_create } = require("./db_helper");
const { gen_db_read, findUserById } = require("./gen_helper");


const defaultPayment = { payment_exp: new Date().toDateString(), balance: 20, amount: 0 };

router.get('/payments/:id', (req, res, next) => {
	let user = {};
	findUserById(req.params.id)
	.then((usr) => {
		user = usr;
		const policyPr = gen_db_read('policy', { name: usr.policy }); // get users policy
		const paymantsPr = gen_db_read('payments', { policy_holder: usr._id }); //get users last payment
		return Promise.all([policyPr, paymantsPr])
	}).then(result => {
		const policy = Array.isArray(result) ? result[0] : user.policy;
		const paymants = Array.isArray(result) ? result[1]: 0;
		let userPayment = {};
		
		Array.isArray(paymants) && paymants.length ? 
		userPayment = paymants[paymants.length -1]:
		userPayment = defaultPayment;
		res.render('payments', { user, policy, userPayment, title: 'Payments' });
	}).catch(e => { res.send({ success: false, data: e })});
});

router.post('/payments', (req, res, next) => {
	const _id = req.body.id;
	const amount = req.body.amount;
	let user = '';
	console.log('_id, amount ', _id, amount);

	Promise.all([findUserById(_id), gen_db_read('payments', { policy_holder: _id })])
	.then(result => {
		const usr  = result[0];
		const paymants  = result[1];
		user = usr
		let userPayment = {};
	
		Array.isArray(paymants) && paymants.length ? 
		userPayment = paymants[paymants.length -1]:
		userPayment = defaultPayment;

		if (Number(amount) && usr && userPayment) {
			return ft_calculatePayment(amount, usr, userPayment)
			// .catch(e => {res.send({ success: false, msg: 'data load error: '+ e })});
		} else {res.send({ success: false, msg: e });}
	})
	.then(procesedPayment => {
		console.log('[POST- PAYMENTS ]		newPayment ', procesedPayment);

		const newPayment = {
			policy_holder: _id,
			amount: procesedPayment.amount,
			balance: procesedPayment.balance,
			payment_exp: procesedPayment.payment_exp,
			all_Monts_Paid: procesedPayment.monthsPaid,
			policy: user.policy,
			time: procesedPayment.date,
			cell: '',
			reference: ''
		};
		db_create('payments', newPayment, (err, data) => {
			res.redirect('/profile/'+ user._id);
			// res.render('profile', { user: req.session.user, title: user.name, user });
		})
	})
	.catch(e => {
		res.send({ success: false, msg: e });
	});
});

module.exports = router;
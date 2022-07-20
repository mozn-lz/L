const express = require("express");
const router = express.Router();
const { db_read, db_create } = require("./db_helper");

let findUserById = (_id) => {
	return new Promise((res, rej) => {
		db_read('users', { _id }, (err, users) => { (err || users.length != 1) ? rej(err): res(users[0]); });
	});
}
let gen_db_read = (table, query) => {
	return new Promise((res, rej) => {
		db_read(table, query, (err, results) => {
			// console.log(table, ': err, results ', err, results);
			err ? rej(err) : res(results);
		});
	});
}

let ft_calculatePayment = async (amount, user, userPayment) => {

	return new Promise((res, rej) => {
		(!amount || amount == 0 || !user ||!userPayment) ? rej('invalid data'):0;
		let policy = '';
		!isNaN(user.policy_payment) ?  
			policy = Number(user.policy_payment): policy = 0;
		const lastMonthbalance = Number(userPayment.balance);
		const lastPayDate = userPayment.payment_exp;
		const lastPayAmount = Number(userPayment.amount);
	
		const lastPayment = {
			month: lastPayDate,
			balance: lastMonthbalance
		};
		let totalPayment = () => Number(amount) + Number(lastPayment.balance);
		let newPayment = {
			amount: 0,
			balance: 0,
			payment_exp: 0,
			lastMonthPaid: 0,
			date: '',
			allMontsPaid: 0,
			monthsPaid: 0,
		};
		display = [];
		let year = 0;
	
		// getMonth() is 0 based
		const lastPayMonth = new Date(lastPayment.month).getMonth();
		
		newPayment.date = new Date();	//	set payment date/timestamp
		let ifbalance = !isNaN(lastPayment.balance) ? Number(lastPayment.balance): 0;
		
		newPayment.amount = totalPayment();
		// set balance
		if (ifbalance > 0) {
			// set lastMonthpaid to lastMonthpaid -1			 * Because last payment was insuficient 
			// * add balance to current-payment and pay lastMonthpaid first 
			newPayment.lastMonthPaid = lastPayMonth;
		} else {
			// set last paid month to last-Paid-Month 
			// pay next month after last-Paid-Month first
			newPayment.lastMonthPaid = lastPayMonth + 1;
		}
		newPayment.monthsPaid = (newPayment.amount - newPayment.amount%policy) / policy; // calculate # of all months paid
	
		let pay = newPayment.amount;
		let balance = 0;
	
		for (let i = 0; pay > 0; i++) {
			// calculate months paid (incl balance)
			newPayment.lastMonthPaid++;
	
			// year incriment
			if (newPayment.lastMonthPaid == 13) {
				newPayment.lastMonthPaid = 1;
				year++;
			}
	
			if (pay >= policy) {
				// monthly premium
				pay -= policy;
			} else {
				// balance
				balance = pay;	// set balance
				pay -= balance; // set pay to 0
			}
			newPayment.balance = balance;	// set overall payment amount

			// Display results
			if (pay == 0) {
				const fullMonth = newPayment.lastMonthPaid;
				const fullDay = '/01/';
				const fullYear = (Number(new Date(lastPayment.month).getFullYear()) + year);
	
				newPayment.payment_exp = fullMonth + fullDay + fullYear;
				console.log(i, pay, '[POST]		newPayment', newPayment);
				res(newPayment);
			}
		}
	});
}
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
		}
		db_create('\n\n\n\t\t\tpayments', newPayment, (err, data) => {
			res.redirect('/profile/'+ user._id);
			// res.render('profile', { user: req.session.user, title: user.name, user });
		})
	})
	.catch(e => {
		res.send({ success: false, msg: e });
	});
});

module.exports = router;
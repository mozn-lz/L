const { db_read } = require("./db_helper");

let findAdminById = (_id) => {
  return new Promise((res, rej) => {
    db_read('admin', { _id }, (err, users) => { (err || users.length != 1) ? rej('User not found') : res(users[0]); });
  });
}
let findUserById = (_id) => {
  return new Promise((res, rej) => {
    db_read('users', { _id }, (err, users) => { (err || users.length != 1) ? rej('User not found') : res(users[0]); });
  });
}
let gen_db_read = (table, query) => {
  return new Promise((res, rej) => {
    db_read(table, query, (err, results) => {
      // console.log(table, ': err, results ', err, results);
      err ? rej('Information not found') : res(results);
    });
  });
}
// POLICY PAYMENT CALCULATOR
let ft_calculatePayment = async (amount, user, userPayment) => {
	return new Promise((res, rej) => {
		(!amount || amount == 0 || !user ||!userPayment) ? rej('invalid data'):0;
		let policy = '';
		!isNaN(user.policy_payment) ?  
			policy = Number(user.policy_payment): policy = 0;
		const lastMonthbalance = Number(userPayment.balance);
		const lastPayDate = userPayment.payment_exp;
	
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
module.exports = {
	findAdminById,
	findUserById,
	gen_db_read,
	ft_calculatePayment
};

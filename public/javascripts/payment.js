// from server
const policy = 2;
const lastMonthbalance = 0;
const latPayDate = 'Mar 01 2022';
const lastPayAmount = Number(30);

let paid = $('#amount').val();
$('#amount').keyup(() => paid = $('#amount').val());

const lastPayment = {
	month: latPayDate,
	balance: lastMonthbalance
};
let totalPayment = () => Number($('#amount').val()) + Number(lastPayment.balance);

let newPayment = {
	amount: Number,
	balance: Number,
	payment_exp: Number,
	lastMonthPaid: Number,
	date: Date,
	allMontsPaid: Number,
	monthsPaid: Number,
};

let display = [];
const ft_displayPayment = (month, code) => {
	let indicae = '';
	if (month >= 1 && month <= 12) {
		// choose display colour code
		switch (code) {
			case 'primary':
				indicae = 'bg-primary';
				break;
			case 'success':
				indicae = 'bg-success';
				break;
			case 'danger':
				indicae = 'bg-danger';
				break;
			case 'info':
				indicae = 'bg-info';
				break;
			case 'secondary':
				indicae = 'bg-secondary';
				break;
			default:
				break;
		}
		// push month
		switch (month) {
				case 1:
					display.push(`<div class="rounded month jan p-3 m-3 ${indicae} col">Jan</div>`);
					break;
				case 2:
					display.push(`<div class="rounded month feb p-3 m-3 ${indicae} col">Feb</div>`);
					break;
				case 3:
					display.push(`<div class="rounded month mar p-3 m-3 ${indicae} col">Mar</div>`);
					break;
				case 4:
					display.push(`<div class="rounded month apr p-3 m-3 ${indicae} col">Apr</div>`);
					break;
				case 5:
					display.push(`<div class="rounded month may p-3 m-3 ${indicae} col">May</div>`);
					break;
				case 6:
					display.push(`<div class="rounded month jun p-3 m-3 ${indicae} col">Jun</div>`);
					break;
				case 7:
					display.push(`<div class="rounded month jul p-3 m-3 ${indicae} col">Jul</div>`);
					break;
				case 8:
					display.push(`<div class="rounded month aug p-3 m-3 ${indicae} col">Aug</div>`);
					break;
				case 9:
					display.push(`<div class="rounded month sep p-3 m-3 ${indicae} col">Sep</div>`);
					break;
				case 10:
					display.push(`<div class="rounded month oct p-3 m-3 ${indicae} col">Oct</div>`);
					break;
				case 11:
					display.push(`<div class="rounded month nov p-3 m-3 ${indicae} col">Nov</div>`);
					break;
				case 12:
					display.push(`<div class="rounded month dec p-3 m-3 ${indicae} col">Dec</div>`);
					break;
			default:
				break;
		}
	} else if (month == 365) {
		// year
			display.push(`<div class="h4">${new Date(lastPayment.month).getFullYear() + Number(code)}</div>`);
	} else if (month == 'done') {
		// done
		while (code <= 12) {
			if (code <= new Date().getMonth() + 1 && 
			new Date(newPayment.payment_exp).getFullYear() <= new Date().getFullYear() )
				ft_displayPayment(code, 'danger');
			else 
				ft_displayPayment(code, 'secondary');
			// if (code > new Date().getMonth() + 1) ft_displayPayment(code, 'secondary');
			code++;
		}
	} else if (month == 'start') {
		// start
		let i = 0;
		while (i < code) {
			// if (code > new Date.now().getMonth() + 1) ft_displayPayment(i, 'secondary');
			ft_displayPayment(i, 'primary');
			i++;
		}
	} else {
		// fuck this
		return null;
	}
};


let ft_calculatePayment = () => {
	display = [];
	let year = 0;

	// getMonth() is 0 based
	const lastPayMonth = new Date(lastPayment.month).getMonth();
	
	newPayment.date = new Date();
	newPayment.balance = !isNaN(lastPayment.balance) ? Number(lastPayment.balance): 0;

	// set balance
	if (newPayment.balance > 0) {
		// set lastMonthpaid to lastMonthpaid -1			 * Because last payment was insuficient 
		// * add balance to current-payment and pay lastMonthpaid first 
		newPayment.lastMonthPaid = lastPayMonth;
		newPayment.amount = totalPayment();
	} else {
		// set last paid month to last-Paid-Month 
		// pay next month after last-Paid-Month first
		newPayment.lastMonthPaid = lastPayMonth + 1;
	}

	let pay = newPayment.amount;
	let balance = 0;

	ft_displayPayment(365, year);	// display current year

	balance == 0 ? 
	ft_displayPayment('start', newPayment.lastMonthPaid + 1): // display Dec if last payment Dec
	ft_displayPayment('start', newPayment.lastMonthPaid); // display months
	for (let i = 0; pay > 0; i++) {
		// calculate months paid (incl balance)
		newPayment.lastMonthPaid++;

		// year incriment
		if (newPayment.lastMonthPaid == 13) {
			newPayment.lastMonthPaid = 1;
			year++;
			ft_displayPayment(365, year);
		}

		if (pay >= policy) {
			// monthly premium
			pay -= policy;
			ft_displayPayment(newPayment.lastMonthPaid, 'success');
		} else {
			// balance
			balance = policy - pay;
			pay -= balance;
			ft_displayPayment(newPayment.lastMonthPaid, 'info');
		}

		// Display results
		if (pay == 0) {
			const fullMonth = newPayment.lastMonthPaid;
			const fullDay = '/01/';
			const fullYear = (Number(new Date(lastPayment.month).getFullYear()) + year);

			newPayment.payment_exp = fullMonth + fullDay + fullYear;
			ft_displayPayment('done', newPayment.lastMonthPaid + 1);
		}
	}

	$('.year').html(display);
}

$('#amount').keyup(() => {
	paid = $('#amount').val();
	const valid_pay = () => !isNaN(paid);

	if (valid_pay() && paid > 0) {
		newPayment.amount = Number(paid);
		$('#amount').css('border', '#198754 solid 2px');

		ft_calculatePayment();
		// ft_displayPayment()
	} else {
		($('#amount').css('border', '#dc3545 solid 2px'));
	}
});

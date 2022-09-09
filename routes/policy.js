const express = require("express");
const { authUser, authPayments } = require("./auth");
const router = express.Router();
const { db_create } = require("./db_helper");
const { gen_db_read } = require("./gen_helper");

router.get('/policy',(req, res, next) => {
	gen_db_read('policy', '')
	.then(policyList => {
		res.render('policy', { user: req.session.user, policyList, title: 'Policy' });
	}).catch(e => { res.send({ success: false, data: e }) });
});

router.post('/policy', (req, res, next) => {
	console.log('_id, amount', req.body);

	for (let i = 0; i < 4; i++) {
		const newPolicy = {};
		(i + 1 == 1) ? (req.body.option1 ? newPolicy.premium = req.body.option1 : newPolicy.option1 = null):0;
		(i + 1 == 2) ? (req.body.option2 ? newPolicy.premium = req.body.option2 : newPolicy.option2 = null):0;
		(i + 1 == 3) ? (req.body.option3 ? newPolicy.premium = req.body.option3 : newPolicy.option3 = null):0;
		(i + 1 == 4) ? (req.body.option4 ? newPolicy.premium = req.body.option4 : newPolicy.option4 = null):0;
		req.body.policyname 	? newPolicy.name  				= req.body.policyname+`_opt-${i+1}`	 : newPolicy.name = null;
		req.body.code					? newPolicy.code 					= req.body.code+(i+1)				 : newPolicy.code = null;
		req.body.description 	? newPolicy.description  	= req.body.description 	 : newPolicy.description = null;
		req.body.members 			? newPolicy.members  			= req.body.members 			 : newPolicy.members = null;

		console.log('newPolicy ', newPolicy);
		if (newPolicy.name && newPolicy.code && newPolicy.description && newPolicy.members) {
				console.log('True ', newPolicy);
				db_create('policy', newPolicy, (err, result) => {
					console.log('policy ', (err, result));
					// res.redirect('/profile/'+ user._id);
					if (result) {
						gen_db_read('policy', '')
						.then(policyList => {
							res.send({ success: true, data: policyList, msg: 'New policy saved' });
						}).catch(e => { res.send({ success: false, msg: 'Error saving new policy' }) });
					} else {
						res.send({ success: false, msg: 'Error saving new policy' });
					}
				});
			} else {
				console.log('false ', newPolicy);
				res.send({ success: false, msg: 'One or more invaild fields' });
			}
	}
});

module.exports = router;
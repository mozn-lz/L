const express = require('express');
const { db_read } = require('./db_helper');
const router = express.Router();

let find_users = (str) => {
	return new Promise((resolve, reject) => {
		db_read('users', str, (err, users) => {
			console.log('1', users.length);
			resolve(users);
		});
	});
}
router.post('/search', (req, res, next) => {
	const findStr = req.body.searchString;
	if (findStr && findStr.length.trim() > 1) {
		find_users(findStr)
		.then(users => res.send(users))
		.catch(e => res.send('No Results ound'));
	} else {
		res.send("String too short");
	}
});

module.exports = router;

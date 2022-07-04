const express = require('express');
const { db_read, db_search } = require('./db_helper');
const router = express.Router();

let find_users = (str) => {
	return new Promise((resolve, reject) => {
		db_search('users', str)
		.then(users => resolve(users))
		.catch(err => reject(err));
	});
}
router.post('/search', (req, res, next) => {
	const findStr = req.body.searchString;

	if (findStr && findStr.trim().length > 0) {
		find_users('%'+findStr+'%')
		.then(users => {console.log('users ', users);res.send(users);}) 
		.catch(e => {console.log('e ', e);res.send('No Results ound');});
	} else {
		res.send("String too short");
	}
});

module.exports = router;

let authUser = (req, res, next) => {
	(req.session.user) ? next() : res.redirect('/login');
}

let authAdmin = {
	view: 	() => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('readusers')) ? next() : res.redirect('/home');}},
	create: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('createusers')) ? next() : res.redirect('/view-admin');}},
	update: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('updateusers')) ? next() : res.redirect('/view-admin');}},
	remove: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('deleteusers')) ? next() : res.redirect('/view-admin');}}
}
let authRights = {
	view: 	() => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('readusers')) ? next() : res.redirect('/home');}},
	create: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('createusers')) ? next() : res.redirect('/view-admin');}},
	update: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('updateusers')) ? next() : res.redirect('/view-admin');}},
	remove: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('deleteusers')) ? next() : res.redirect('/view-admin');}}
}
let authClents = {
	view: 	() => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('readclients')) ? next() : res.redirect('/home');}},
	create: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('createclients')) ? next() : res.redirect('/');}},
	update: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('updateclients')) ? next() : res.redirect('/');}},
	remove: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('deleteclients')) ? next() : res.redirect('/');}}
}
let authPayments = {
	view: 	() => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('readpayments')) ? next() : res.redirect('/home');}},
	create: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('createpayments')) ? next() : res.redirect('/');}},
	update: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('updatepayments')) ? next() : res.redirect('/');}},
	remove: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('deletepayments')) ? next() : res.redirect('/');}}
}
let authReports = {
	view: 	() => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('readreports')) ? next() : res.redirect('/home');}},
	create: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('createreports')) ? next() : res.redirect('/reports');}},
	update: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('updatereports')) ? next() : res.redirect('/reports');}},
	remove: () => {return (req, res, next) => {(req.session.user && req.session.user.rights.hasOwnProperty('deletereports')) ? next() : res.redirect('/reports');}}
}

module.exports = {
	authUser,
	authAdmin,
	authRights,
	authClents,
	authPayments,
	authReports
}
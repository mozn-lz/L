const ROLE = {
    LOGGEDIN: 'user',
    ADMIN: 'admin'
}
let authUser = (req, res, next) => {
    if (req.user == null) {
        res.status(403);
        return res.send('Sign in required');
    }
    next();
}

let authRole = (role) => {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            res.status(401);
            return res.send('Not allowed');
        }
        next();
    }
}

module.exports = {
    ROLE,
    authUser,
    authRole
}
const jwt = require('jsonwebtoken');

function employeeAuth(req, res, next) {
    try {
        // Check if token exists in cookies or headers
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        if (!token) {
            req.flash('error', 'You must be logged in to access that page.');
            return res.redirect('/account/login');
        }

        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check account type
        if (payload.account_type === 'Employee' || payload.account_type === 'Admin') {
            // Authorized
            req.accountData = payload;
            next();
        } else {
            // Not authorized
            req.flash('error', 'You do not have permission to access that page.');
            return res.redirect('/account/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'Invalid token. Please log in again.');
        return res.redirect('/account/login');
    }
}

module.exports = employeeAuth;

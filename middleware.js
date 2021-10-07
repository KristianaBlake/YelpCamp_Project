module.exports.isLoggedIn = (req, res, next) => {
    // .isAuthenticated() is a helper method from passport that uses the session that is automatically added to the reqest object 
    // "if you are not authenticated"
    if (!req.isAuthenticated()) {
        // store the url they are requesting! 
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
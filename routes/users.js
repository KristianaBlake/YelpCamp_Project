const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { reviewSchema } = require('../schemas');
const catchAsyncError = require('../utils/catchAsync');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsyncError(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}));

// serves login form
router.get('/login', (req, res) => {
    res.render('users/login');
})

// the actual logging in and checking to make sure credentials are valid

// the "local" in possport authenticate, means the local browser
// faiureFlash: gonna flash a message for us automatically
// failureRedirect: if things go wrong, redirect to the login page again
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/campgrounds');

})

module.exports = router; 
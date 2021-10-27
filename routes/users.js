const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { reviewSchema } = require('../schemas');
const catchAsyncError = require('../utils/catchAsync');
const users = require('../controllers/users');

router.get('/register', users.renderRegister);

router.post('/register', catchAsyncError(users.register));

// serves login form
router.get('/login', users.renderLogin);

// the actual logging in and checking to make sure credentials are valid

// the "local" in possport authenticate, means the local browser
// faiureFlash: gonna flash a message for us automatically
// failureRedirect: if things go wrong, redirect to the login page again
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login);

router.get('/logout', users.logout);

module.exports = router; 
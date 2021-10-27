const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');

module.exports.isLoggedIn = (req, res, next) => {
    // .isAuthenticated() is a helper method from passport that uses the session that is automatically added to the reqest object 
    // "if you are not authenticated"
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    // once we have the schema defined, all we do is pass our data through to our schema 
    // we are destructuring to get the error 
    const { error } = campgroundSchema.validate(req.body);
    // this check to see if there is an error
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        // if there is an error it will be caught and thrown to our custom 
        // error handler further down the page (app.use())
        
        // we will also throw the error with the message variable we created above 
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params; 
    const campground = await Campground.findById(id);
    // checking the right authorization 
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    } 
    next();
}

module.exports.validateReview = (req, res, next) => {
    // check for an error from the object we get back from the reviewSchema
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};
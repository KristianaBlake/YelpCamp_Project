const express = require('express');
const router = express.Router();
const { campgroundSchema } = require('../schemas.js');
const catchAsyncError = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

const validateCampground = (req, res, next) => {
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


router.get('/', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// create page 
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
})

// creating campground
router.post('/', validateCampground, catchAsyncError (async (req, res, next) => { 
    // this is basic rudimentary logic: 
        // if NOT req.body.campground (if it doesn't exist), we'll just throw a new express error
        // We "throw" the express error because we are inside the async function and the catchAsync
        // is going to catch that error and hand it off to "next" which takes the error down to the 
        // app.use() function near the bottom of the page (where the custom error handling is)
     // ->  // if(!req.body.campgound) throw new ExpressError('Invalid Campground Data', 400);

    // this is not a mongoose schema
    // this is going to validate our (req.body) data before we attempt to save it with mongoose (before we involve mongoose)

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// show page 
router.get('/:id', catchAsyncError(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground })
}));

// edit page 
router.get('/:id/edit', catchAsyncError(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}));

// updating a campground
router.put('/:id', validateCampground, catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    // the method findByIdAndUpdate is taking the id as a parameter
    // and everything that is in the body of the request object for the model campround 
    // (req.body.campground) and  will fill new information (using the spread operator {...})
    // for that specific id 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    req.flash('success', 'Successfully updated campground!');
    // redirect to the show page of the campground we just updated
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', catchAsyncError(async (req, res, next) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds');

}));




module.exports = router;
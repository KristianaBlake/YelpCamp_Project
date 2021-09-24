const express = require('express');
// Express router likes to keep params separate. By default, 
// we won't have access to that id in our reviews routes because
// routers get separate params
// But we can specify an option {mergeParams: true }. 
// Now all the params are going to be merged. 
const router = express.Router({ mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/ExpressError');
const catchAsyncError = require('../utils/catchAsync');

const validateReview = (req, res, next) => {
    // check for an error from the object we get back from the reviewSchema
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
};

// post route to create review for specific campground 
router.post('/', validateReview, catchAsyncError(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// deleting a campground with associated reviews 
router.delete('/:reviewId', catchAsyncError(async (req, res) => {
    // using mongo operator called "pull" to grab that *one* campground object id 
    // from an array of object ids 
    const { id, reviewId } = req.params;
    // the $pull mongo operator will pull out any matching reviewIds from the array of reviews ids 
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router; 
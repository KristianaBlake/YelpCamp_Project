const express = require('express');
// Express router likes to keep params separate. By default, 
// we won't have access to that id in our reviews routes because
// routers get separate params
// But we can specify an option {mergeParams: true }. 
// Now all the params are going to be merged. 
const router = express.Router({ mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const ExpressError = require('../utils/ExpressError');
const catchAsyncError = require('../utils/catchAsync');

// post route to create review for specific campground 
router.post('/', isLoggedIn, validateReview, catchAsyncError(reviews.createReview))

// deleting a campground with associated reviews 
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsyncError(async (req, res) => {
    // using mongo operator called "pull" to grab that *one* campground object id 
    // from an array of object ids 
    const { id, reviewId } = req.params;
    // the $pull mongo operator will pull out any matching reviewIds from the array of reviews ids 
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Sucessfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router; 
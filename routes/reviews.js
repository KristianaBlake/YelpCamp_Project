const express = require('express');
const router = express.Router();

// post route to create review for specific campground 
router.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// deleting a campground with associated reviews 
router.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    // using mongo operator called "pull" to grab that *one* campground object id 
    // from an array of object ids 
    const { id, reviewId } = req.params;
    // the $pull mongo operator will pull out any matching reviewIds from the array of reviews ids 
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router; 
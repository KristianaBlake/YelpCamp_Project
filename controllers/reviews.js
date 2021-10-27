const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    // using mongo operator called "pull" to grab that *one* campground object id 
    // from an array of object ids 
    const { id, reviewId } = req.params;
    // the $pull mongo operator will pull out any matching reviewIds from the array of reviews ids 
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Sucessfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}
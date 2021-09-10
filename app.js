const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const catchAsyncError = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');

// this is logic here saying use our local development database OR if this is in production 
    // use the production database

// yelp-camp is the name of the database 

// then we pass in our options so our database won't yell at us 
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true, 
    useCreateIndex: true, 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
const morgan = require('morgan');
const { appendFile } = require('fs');
const catchAsync = require('./utils/catchAsync');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// this parses the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));


const validateReview = (req, res, next) => {
    // check for an error from the object we get back from the reviewSchema
    const { error } = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.use('/campgrounds', campgrounds)

app.get('/', (req, res) => {
    res.render('home');
});

// post route to create review for specific campground 
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// deleting a campground with associated reviews 
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    // using mongo operator called "pull" to grab that *one* campground object id 
    // from an array of object ids 
    const { id, reviewId } = req.params;
    // the $pull mongo operator will pull out any matching reviewIds from the array of reviews ids 
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

// this will only run if nothing has matched first and we didn't get a response from any of them
// app.all() is for every single request
// * - means for every path
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// custom error handling/ our custom error handler 
app.use((err, req, res, next) => {
    const {statusCode = 500 }  = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
})
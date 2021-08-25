const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsyncError = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Campground = require('./models/campground');

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

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// create page 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
})

app.post('/campgrounds', catchAsyncError(async (req, res, next) => {
    // if NOT req.body.campground (if it doesn't exist), we'll just throw a new express error
    // We "throw" the express error because we are inside the async function and the catchAsync
    // is going to catch that error and hand it off to "next" which takes the error down to the 
    // app.use() function near the bottom of the page (where the custom error handling is)
    if(!req.body.campgound) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// show page 
app.get('/campgrounds/:id', catchAsyncError(async(req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
}));

// edit page 
app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}));

app.put('/campgrounds/:id', catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    // the method findByIdAndUpdate is taking the id as a parameter
    // and everything that is in the body of the request object for the model campround 
    // (req.body.campground) and  will fill new information (using the spread operator {...})
    // for that specific id 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    // redirect to the show page of the campground we just updated
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsyncError(async (req, res, next) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds');

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
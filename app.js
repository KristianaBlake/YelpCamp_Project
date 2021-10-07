const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// this is logic here saying use our local development database OR if this is in production 
    // use the production database

// yelp-camp is the name of the database 

// then we pass in our options so our database won't yell at us 
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false, 
    saveUninitialized: true,
    cookie: {
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// we are telling passport to use the local strategy (that we have downloaded and required)
passport.use(new LocalStrategy(User.authenticate()));
// this is telling passport how to serialize a User (how to store a User in a session)
passport.serializeUser(User.serializeUser());
// this will de-serialize a User, it will un-store a User in a session
passport.deserializeUser(User.deserializeUser());

// middleware for flash to display success message
// ** it is important that we put this before our route handlers **
app.use((req, res, next) => {
    // they are res.locals because I have access to this on 
    // every single template 
    res.locals.currentUser = req.user; 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

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
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

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
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
// const dbUrl = process.env.DB_URL; 

// this is logic here saying use our local development database OR if this is in production 
    // use the production database

// yelp-camp is the name of the database 
// local database: 'mongodb://localhost:27017/yelp-camp-v2'

// then we pass in our options so our database won't yell at us 
mongoose.connect('mongodb://localhost:27017/yelp-camp-v2', {
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
app.use(mongoSanitize({
    replaceWith: '_'
}))

const sessionConfig = {
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false, 
    saveUninitialized: true,
    cookie: {
        // our cookies set through the session are only accessible
        // through HTTP
        httpOnly: true, 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/ddit9z8fh/image/upload/v1635537769/YelpCamp/", // CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
// we are telling passport to use the local strategy (that we have downloaded and required)
passport.use(new LocalStrategy(User.authenticate()));
// this is telling passport how to serialize a User (how to store a User in a session)
passport.serializeUser(User.serializeUser());
// this will de-serialize a User, it will un-store a User in a session
passport.deserializeUser(User.deserializeUser());

// middleware for *** allroutes *** 
// ** it is important that we put this before our route handlers **
// app.use() is express' way of saying : anything inside of our parenthesis are going 
// to be used every time a request is made 
app.use((req, res, next) => {
    // console.log(req.session)

    // if you aren't going from any of these two routes: (login and the homepage), then
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
        // store where the user was on the session because it is a way to store
        // where you previously where from one request to another request
        req.session.returnTo = req.originalUrl;
    }
    // res.locals because I have access to this on every single template 
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
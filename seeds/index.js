// we will run this file separately when we want to seed our database 

// this file is going to connect to mongoose and use the Campground model file
const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');

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

// we are going to starty by deleting everything in the database 
const seedDB = async () => {
    await Campground.deleteMany({});
    // looping 50 times 
    for (let i = 0; i < 50; i++) {
        // here we are going to pick a random number and use that number to pick a city
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`
        })
        await camp.save();
    }
    
}

seedDB();
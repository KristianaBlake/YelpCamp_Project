// we will run this file separately when we want to seed our database 

// this file is going to connect to mongoose and use the Campground model file
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

// this is logic here saying use our local development database OR if this is in production 
    // use the production database

// yelp-camp is the name of the database 

// then we pass in our options so our database won't yell at us 
mongoose.connect('mongodb://localhost:27017/yelp-camp-v2', {
    // useNewUrlParser: true, 
    // useCreateIndex: true, 
    // useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// grabbing a random element out of an array 
// we pass in an array and get back a random element from that array
const sample = array => array[Math.floor(Math.random() * array.length)];

// we are going to starty by deleting everything in the database 
const seedDB = async () => {
    await Campground.deleteMany({});
    // looping 50 times 
    for (let i = 0; i < 50; i++) {
        // here we are going to pick a random number and use that number to pick a city
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            // user_id of username "indigo"
            author: '6178caba5c9cfc50384adcdb',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Est, non quidem exercitationem temporibus natus ipsam? Aperiam illum quas ex, dolorem cum quaerat, error aliquid suscipit assumenda necessitatibus exercitationem, veritatis debitis?',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/ddit9z8fh/image/upload/v1635537769/YelpCamp/dyeux7rkpxmasmuaqz27.jpg',
                  filename: 'YelpCamp/dyeux7rkpxmasmuaqz27',
                },
                {
                  url: 'https://res.cloudinary.com/ddit9z8fh/image/upload/v1635537770/YelpCamp/hygkiru85doojuufb7hk.jpg',
                  filename: 'YelpCamp/hygkiru85doojuufb7hk',
                }
              ]
        })
        await camp.save();
    }
    
}

seedDB().then(() => {
    mongoose.connection.close();
})
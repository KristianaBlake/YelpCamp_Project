const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// making our Schema 
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number, 
    description: String, 
    location: String,
    reviews: [
        {
            // this is an Object Id from the Review Model
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Campground', CampgroundSchema);
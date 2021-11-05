const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;


// By default, Mongoose does not include virtuals when you convert 
// a document to JSON. To include virtuals, you need the code below
const opts = { toJSON: { virtuals: true } }

// making our Schema 
const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String, 
            filename: String,
        }
    ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number, 
    description: String, 
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            // this is an Object Id from the Review Model
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post('findOneAndDelete', async function(doc){
    // if a document to delete was found
    // we are going to call Review.remove()
    if(doc){
        // we are passing in a query to .remove()
        //  - the id for each review is somehwere $in our document.reviews (doc.reviews)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
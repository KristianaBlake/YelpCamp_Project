const mongoose = require('mongoose');
const Review = require('./review');
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
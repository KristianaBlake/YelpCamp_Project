const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");
 
 module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}).populate({
        path: 'popupText',
        strictPopulate: false,
    });
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res, next) => { 
    // this is basic rudimentary logic: 
        // if NOT req.body.campground (if it doesn't exist), we'll just throw a new express error
        // We "throw" the express error because we are inside the async function and the catchAsync
        // is going to catch that error and hand it off to "next" which takes the error down to the 
        // app.use() function near the bottom of the page (where the custom error handling is)
     // ->  // if(!req.body.campgound) throw new ExpressError('Invalid Campground Data', 400);

    // this is not a mongoose schema
    // this is going to validate our (req.body) data before we attempt to save it with mongoose (before we involve mongoose)

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    console.log(geoData);
    const campground = new Campground(req.body.campground);
    // files is going to include an array of photos 
    // we loop over the path and file name and add it to the newly created campground
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    console.log(campground.images)
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'author',
        strictPopulate: false
    })
    await campground.populate({path: 'reviews', populate: 'author'})
    // if you didn't find a campground, or mongoose didn't find a campground with that id, 
    // thenn flash error
    // and redirect to the campgrounds homepage 
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res, next) => {
    const {id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res, next) => {
    const { id } = req.params;
    console.log(req.body);
    // the method findByIdAndUpdate is taking the id as a parameter
    // and everything that is in the body of the request object for the model campround 
    // (req.body.campground) and  will fill new information (using the spread operator {...})
    // for that specific id 
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }
    
    req.flash('success', 'Successfully updated campground!');
    // redirect to the show page of the campground we just updated
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res, next) => {
    const { id } = req.params; 
    await Campground.findByIdAndDelete(id); 
    res.redirect('/campgrounds');
}
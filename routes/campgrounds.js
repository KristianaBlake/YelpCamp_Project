const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsyncError = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const Campground = require('../models/campground')

router.route('/')
    .get(catchAsyncError(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsyncError(campgrounds.createCampground))
    .post(upload.array('image'),(req, res) => {
        console.log(req.body, req.files);
    })

// create page 
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsyncError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsyncError(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsyncError(campgrounds.deleteCampground))

// edit page 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campgrounds.renderEditForm))

module.exports = router;
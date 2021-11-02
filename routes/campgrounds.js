const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsyncError = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor} = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground')

router.route('/')
    .get(catchAsyncError(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsyncError(campgrounds.createCampground))
   

// create page 
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsyncError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsyncError(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsyncError(campgrounds.deleteCampground))

// edit page 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campgrounds.renderEditForm))

module.exports = router;
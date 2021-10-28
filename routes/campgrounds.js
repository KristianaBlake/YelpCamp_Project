const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsyncError = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor} = require('../middleware');

const Campground = require('../models/campground')

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsyncError(campgrounds.createCampground))

// create page 
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsyncError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsyncError(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsyncError(campgrounds.deleteCampground))

// edit page 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campgrounds.renderEditForm))

module.exports = router;
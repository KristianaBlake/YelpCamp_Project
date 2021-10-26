const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsyncError = require('../utils/catchAsync');
const { isLoggedIn, validateCampground, isAuthor} = require('../middleware');

const Campground = require('../models/campground');

router.get('/', catchAsyncError(campgrounds.index));

// create page 
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// creating campground
router.post('/', isLoggedIn, validateCampground, catchAsyncError (campgrounds.createCampground));

// show page 
router.get('/:id', catchAsyncError(campgrounds.showCampground));

// edit page 
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsyncError(campgrounds.renderEditForm));

// updating a campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsyncError(campgrounds.updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsyncError(campgrounds.deleteCampground));

module.exports = router;
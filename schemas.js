const Joi = require('joi');

module.exports.campgroundSchema = Joi.object({
    // "campground" is a *key*
    // "object" is *type* and reqired is a necessary param
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});
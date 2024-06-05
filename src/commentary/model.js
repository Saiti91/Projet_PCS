const Joi = require('joi');

const apartmentCommentSchema = Joi.object({
    type: Joi.string().valid('apartment').required(),
    id: Joi.string().required(),
    comment: Joi.string().required()
});

const serviceProviderCommentSchema = Joi.object({
    type: Joi.string().valid('serviceProvider').required(),
    id: Joi.string().required(),
    comment: Joi.string().required()
});

module.export = {apartmentCommentSchema, serviceProviderCommentSchema};
const Joi = require("joi");

function idParamGuard(req, _res, next) {
    const paramSchema = Joi.string()
        .regex(/^0*[1-9]+[0-9]*$/)
        .messages({ "string.pattern.base": "Id must be a number superior to 1." })
        .required();
    const { error } = paramSchema.validate(req.params.id);

    if (error) {
        throw error;
    }

    next();
}

module.exports = idParamGuard;

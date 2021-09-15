const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.farmSchema = Joi.object({
    farm: Joi.object({
        name: Joi.string().required().escapeHTML,
        city: Joi.string().required().escapeHTML,
        email: Joi.string().required().escapeHTML
    }).required()
})


module.exports.productSchema = Joi.object({
    product: Joi.object({
        name: Joi.string().required().escapeHTML,
        price: Joi.number().required(),
        category: Joi.string().required().escapeHTML
    }).required()
})
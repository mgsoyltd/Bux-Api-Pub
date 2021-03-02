const mongoose = require("mongoose");
const Joi = require("joi");

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    size: Number,
    data: {
        type: Buffer,
        required: true
    },
    contentType: {
        type: String,
        required: true
    }
});

function validateImage(image) {
    const schema = Joi.object(
        {
            name: Joi.string().max(256).required(),
            size: Joi.number(),
            contentType: Joi.string().required(),
            data: Joi.binary().required()
        });

    return schema.validate(image._doc);
}

const Images = mongoose.model("images", imageSchema);

exports.imageSchema = imageSchema;
exports.Images = Images;
exports.validateImage = validateImage;
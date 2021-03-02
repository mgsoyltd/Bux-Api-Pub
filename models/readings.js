const Joi = require("joi");
const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const readingsSchema = new mongoose.Schema({
	users_id: {
		type: ObjectID,
		required: true,
	},
	books_id: {
		type: ObjectID,
		required: true,
	},
	current_page: {
		type: Number,
	},
	time_spent: {
		type: Number
	},
	rating: {
		type: Number
	},
	comments: {
		type: String
	}
},
	{ timestamps: true }	// managed 
);

const Readings = mongoose.model("readings", readingsSchema);

function validateReadings(readings) {
	const schema = Joi.object(
		{
			users_id: Joi.objectId().required(),
			books_id: Joi.objectId().required(),
			current_page: Joi.number(),
			time_spent: Joi.number(),
			rating: Joi.number(),
			comments: Joi.string()
		});
	return schema.validate(readings);
}

exports.readingsSchema = readingsSchema;
exports.Readings = Readings;
exports.validate = validateReadings;


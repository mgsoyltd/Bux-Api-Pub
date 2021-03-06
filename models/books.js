const Joi = require("joi");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
	title: {
		type: String,
		maxlength: 255,
		required: true,
	},
	author: {
		type: String,
		maxlength: 255,
		required: true,
	},
	ISBN: {
		type: String,
		minlength: 10,
		maxlength: 20,
		unique: true,
		required: true,
	},
	description: String,
	pages: Number,
	imageURL: String,
	public_id: String,
	image: {
		data: Buffer,
		contentType: String
	}
});

const Books = mongoose.model("books", bookSchema);

function validateBook(book) {
	const schema = Joi.object(
		{
			title: Joi.string().max(255).required(),
			author: Joi.string().max(255).required(),
			ISBN: Joi.string().min(10).max(20).required(),
			description: Joi.string().empty(''),
			pages: Joi.number(),
			imageURL: Joi.string().empty(''),	// !! Allow empty string !!
			public_id: Joi.string().empty(''),	// !! Allow empty string !!
			image: Joi.allow(null),
			book: Joi.allow(null),
		});
	return schema.validate(book);
}

exports.bookSchema = bookSchema;
exports.Books = Books;
exports.validate = validateBook;

const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const passwordComplexity = require('joi-password-complexity');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 50,
	},
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	isAdmin: Boolean,
	host: {
		type: String,
	},
	api_key: {
		type: String,
		minlength: 30,
		maxlength: 30,
	},
	usage: [
		{
			date: String,
			count: Number,
		}
	]
});

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign(
		{ // payload
			_id: this._id,
			name: this.name,
			email: this.email,
			isAdmin: this.isAdmin
		},
		config.get("jwtPrivateKey")
	);
	return token;
};

const User = mongoose.model("users", userSchema);

function validateUser(user) {
	const schema = Joi.object(
		{
			name: Joi.string().min(3).max(50).required(),
			email: Joi.string().min(5).max(255).required().email(),
			password: passwordComplexity()
		});

	return schema.validate(user);
}

exports.userSchema = userSchema;
exports.User = User;
exports.validate = validateUser;

const config = require("config");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 5,
		maxlength: 255,
		unique: true,
	},
	hash: String,
	salt: String,
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

const User = mongoose.model("users", userSchema);

exports.userSchema = userSchema;
exports.User = User;


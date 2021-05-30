const config = require("config");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { getApiKey, validateKey } = require("../middleware/apikeys");
const validateObjectId = require("../middleware/validateObjectId");
const { User } = require("../models/user");
const authutils = require("../src/authutils");

const normalView = ["_id", "email", "name"];

/**
 * Validate email and password passed in req.body
 * @param {*} req.body
 * @returns 	Joi.ValidationResult
 */
function validate(req) {

	const schema = Joi.object(
		{
			name: Joi.string().min(3).max(50).required(),
			email: Joi.string().min(5).max(255).required().email(),
			password: passwordComplexity()
		});

	return schema.validate(req);
}

/**
 * Get all users sorted by email
 * !! User must be authenticated admin
 */
router.get("/", [validateKey, auth, admin], async (req, res) => {

	const users = await User.find().sort("email");
	res.send(users);

});

/**	
 * Register a new user
 * @param req.body.email			User e-mail
 * @param req.body.password		Password (plain text)
 * @param req.body.name				User name (optional)
 */
// router.post("/", [validateKey, auth, admin], async (req, res) => {
router.post("/", [validateKey], async (req, res) => {

	const { error } = validate(req.body);
	if (error)
		return res.status(400).send(error.details[0].message);

	// Look up user by email
	let user = await User.findOne({ email: req.body.email });
	if (user)
		return res.status(400).json({ success: false, msg: "User already registered." });

	// console.log(req.body);

	try {
		// New user object
		user = new User(_.pick(req.body, ["email", "name"]));

		// Generage API Key
		user = getApiKey(user, req);

		// Hash the password
		const saltHash = authutils.genPassword(req.body.password);
		user.salt = saltHash.salt;
		user.hash = saltHash.hash;

		// console.log(user);

		// Save to DB
		await user.save();

	} catch (err) {
		// Bad Request
		return res.status(400).json({ success: false, msg: err.message });
	}

	// Created successfully
	res.status(201).json({ success: true, user: user });
	// res.status(201).json({ success: true, user: _.pick(user, normalView) });

});

/**	
 * Get current user by the token
 * !! User must be authenticated  
 */
router.get("/me", [validateKey, auth], async (req, res) => {

	const user = await User.findById(req.user._id).select("-hash");	// exclude hashed pw
	if (!user)
		return res.status(404).json({ success: false, msg: "The user with the given ID was not found." });

	if (!user.isAdmin) {
		// Limited data returned to normal user
		return res.json({ success: true, user: _.pick(user, normalView) });
	}

	// Admin can see all user data
	return res.json({ success: true, user: user });
});

/**	
 * Get user by ID (admin)
 * Endpoint: /<objectid>
 * !! User must be authenticated admin
 */
router.get("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {

	const user = await User.findById(req.params.id).select("-__v");		// exclude versionKey
	if (!user)
		return res.status(404).json({ success: false, msg: "The user with the given ID was not found." });

	return res.json({ success: true, user: user });
});

/**	
 * Update user by ID
 * Endpoint: /<objectid>
 * @param req.body.email			User e-mail
 * @param req.body.password		Password (plain text)
 * @param req.body.name				User name (optional)
 * !! User must be authenticated 
 */
router.put("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	let request = _.pick(req.body, ["email", "name", "password"]);
	const { error } = validate(request);
	if (error)
		return res.status(400).json({ success: false, msg: error.details[0].message });

	// Current password is needed for changes
	if (!req.body.password)
		return res.status(400).json({ success: false, msg: "Password is required.." });

	// Look up user from DB by ID
	let user = await User.findById(req.params.id).select("-__v");		// exclude versionKey
	if (!user)
		return res.status(401).json({ success: false, msg: "Invalid email or password." });

	// Validate current password
	const isValid = authutils.validPassword(req.body.password, user.hash, user.salt);
	if (!isValid) {
		res.status(401).json({ success: false, msg: "Invalid email or password" });
	}

	// All good - email can be changed and a new password via req.body.newpass

	// Check if password change requested
	if (req.body.newpass) {

		let newPassword = req.body.newpass;
		if (!newPassword)
			return res.status(400).json({ success: false, msg: "New password cannot be empty!" });

		// Update and validate the new password
		request.password = newPassword;
		const { error } = validate(request);
		if (error)
			return res.status(400).json({ success: false, msg: error.details[0].message });

		// Hash the new password
		const saltHash = authutils.genPassword(newPassword);
		user.salt = saltHash.salt;
		user.hash = saltHash.hash;
	}
	else {
		// Only email and name can be updated - validate if changed
		if (user.email !== req.body.email || user.name !== req.body.name) {
			const { error } = validate(request);
			if (error)
				return res.status(400).json({ success: false, msg: error.details[0].message });
		}
	}

	try {
		user.email = req.body.email;
		user.name = req.body.name;

		// Save to DB
		await user.save();

	} catch (ex) {
		return res.status(400).json({ success: false, msg: ex.message });
	}

	// Return limited view of user data
	return res.json({ success: true, user: _.pick(user, normalView) });

});

/**	
 * Delete user by ID
 * Endpoint: /<objectid>
 * !! User must be authenticated admin
 */
router.delete("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {

	const user = await User.findByIdAndRemove(req.params.id);

	if (!user)
		return res.status(404).json({ success: false, msg: "The user with the given ID was not found." });

	return res.json({ success: true, user: _.pick(user, normalView) });

});

module.exports = router;

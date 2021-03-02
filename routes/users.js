const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { getApiKey, validateKey } = require("../middleware/apikeys");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");

// Get all users sorted by name
router.get("/", [validateKey, auth, admin], async (req, res) => {
	const users = await User.find().sort("name");
	res.send(users);
});

// See npm joi-password-complexity for password requirements

// Create a new user
router.post("/", [validateKey, auth, admin], async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send("User already registered.");

	user = new User(_.pick(req.body, ["name", "email", "password"]));
	try {
		// Generage API Key
		user = getApiKey(user, req);
		// Hash the password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);
		// Save to DB
		await user.save();
	} catch (ex) {
		return res.status(400).send(ex.message);
	}

	const token = user.generateAuthToken();
	res
		.header("x-auth-token", token)
		.header("access-control-expose-headers", "x-auth-token")
		.header("x-api-key", user.api_key)
		.status(201)
		.send(_.pick(user, ["_id", "name", "email"]));
});

// Get current user by the token
router.get("/me", [validateKey, auth], async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");	// exclude pw
	if (!user)
		return res.status(404).send("The user with the given ID was not found.");

	res.send(user);
});

// Get user by ID (admin)
// Endpoint: /<objectid>
router.get("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {
	const user = await User.findById(req.params.id).select("-__v");		// exclude versionKey

	if (!user)
		return res.status(404).send("The user with the given ID was not found.");

	res.send(user);
});

// Update user by ID
// Endpoint: /<objectid>
// Body: <user object> 
router.put("/:id", [validateKey, auth, validateObjectId], async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Invalid email or password.');

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) {
		// Password has been changed - encrypt it
		try {
			user.name = req.body.name;
			user.email = req.body.email;
			// Hash the new password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(req.body.password, salt);
			// Save to DB
			await user.save();
		} catch (ex) {
			return res.status(400).send(ex.message);
		}
		// Require re-login by clearing the token
		const token = "";   // user.generateAuthToken();

		console.log("PW CHANGED - LOGIN REQUIRED:", token);

		res
			.header("x-auth-token", token)
			.header("access-control-expose-headers", "x-auth-token")
			.send(_.pick(user, ["_id", "name", "email"]));
	}
	else {
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
			},
			{
				new: true,
			}
		);

		if (!user)
			return res.status(404).send("The user with the given ID was not found.");

		res.send(user);
	}
});

// Delete user by ID
// Endpoint: /<objectid>
router.delete("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {
	const user = await User.findByIdAndRemove(req.params.id);

	if (!user)
		return res.status(404).send("The user with the given ID was not found.");

	res.send(user);
});

module.exports = router;

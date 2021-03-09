const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { getApiKey, validateKey } = require("../middleware/apikeys");
const validateObjectId = require("../middleware/validateObjectId");
const { User, validate } = require("../models/user");

const normalView = ["_id", "name", "email"];

// Get all users sorted by name
router.get("/", [validateKey, auth, admin], async (req, res) => {
	const users = await User.find().sort("name");
	res.send(users);
});

// Create a new user
router.post("/", [validateKey, auth, admin], async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(400).send("User already registered.");

	console.log(req.body);

	user = new User(_.pick(req.body, ["name", "email", "password"]));
	try {
		// Generage API Key
		user = getApiKey(user, req);

		console.log(user);

		// Hash the password
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(user.password, salt);

		console.log(user);

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
		.send(_.pick(user, normalView));
});

// Get current user by the token
router.get("/me", [validateKey, auth], async (req, res) => {

	const user = await User.findById(req.user._id).select("-password");	// exclude pw
	if (!user)
		return res.status(404).send("The user with the given ID was not found.");

	if (!user.isAdmin) {
		return res.send(_.pick(user, normalView));
	}
	return res.send(user);
});

// Get user by ID (admin)
// Endpoint: /<objectid>
router.get("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {

	const user = await User.findById(req.params.id).select("-__v");		// exclude versionKey
	if (!user) return res.status(404).send("The user with the given ID was not found.");

	return res.send(user);
});

// Update user by ID
// Endpoint: /<objectid>
// Body: <user object> 
router.put("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	let request = _.pick(req.body, ["name", "email", "password"]);
	const { error } = validate(request);
	if (error) return res.status(400).send(error.details[0].message);

	if (!req.body.password) return res.status(400).send("Password is required..");

	user = await User.findOne({ email: req.body.email });
	if (!user) return res.status(400).send('Invalid email or password.');

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).send('Invalid email or password.');

	// ALl good - name and email can be changed and a new password via req.body.newpass

	// Check if password change requested
	if (req.body.newpass) {
		let newPassword = req.body.newpass;
		if (!newPassword) return res.status(400).send("New password cannot be empty!");

		// Update and validate the new password
		request.password = newPassword;
		const { error } = validate(request);
		if (error) return res.status(400).send(error.details[0].message);

		try {
			user.name = req.body.name;
			user.email = req.body.email;
			// Hash the new password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);

			// Save to DB
			await user.save();

		} catch (ex) {
			return res.status(400).send(ex.message);
		}
	}
	else {
		// Only name of email can be updated
		user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				email: req.body.email,
				password: user.password,		// No change to pw
			},
			{
				new: true,		// return updated document
			}
		);
	}

	if (!user) return res.status(404).send("The user with the given ID was not found.");

	res.send(_.pick(user, normalView));
});

// Delete user by ID
// Endpoint: /<objectid>
router.delete("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {
	const user = await User.findByIdAndRemove(req.params.id);

	if (!user) return res.status(404).send("The user with the given ID was not found.");

	res.send(_.pick(user, normalView));
});

module.exports = router;

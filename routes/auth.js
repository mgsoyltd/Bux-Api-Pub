const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { User } = require('../models/user');
const { validateKey } = require("../middleware/apikeys");
const authutils = require("../src/authutils");

/**	
 * Login Authentication to validate an existing user and issue a JWT
 * Body: { email, password } 
 * @param {*} req.body.email 		- user's e-mail address
 * @param {*} req.body.password - user's password (plain text)
 * @returns res.status 200 - authorized with res.jwt
 * 					res.status 401 - unauthorized
 */
router.post('/', validateKey, async (req, res) => {

	const { error } = validate(req.body);
	if (error)
		return res.status(400).json({ success: false, msg: error.details[0].message });

	let user = await User.findOne({ email: req.body.email });
	if (!user)
		return res.status(401).json({ success: false, msg: "Invalid email or password." });

	const isValid = authutils.validPassword(req.body.password, user.hash, user.salt);

	if (isValid) {
		const tokenObject = authutils.issueJWT(user);
		res.status(200).json(
			{
				success: true,
				token: tokenObject.token,
				expiresIn: tokenObject.expires,
				name: user.name,
				isAdmin: user.isAdmin
			});
	} else {
		res.status(401).json({ success: false, msg: "Invalid email or password" });
	}

});

function validate(req) {

	const schema = Joi.object(
		{
			email: Joi.string().min(5).max(255).required().email(),
			password: Joi.string().min(5).max(255).required()
		});

	return schema.validate(req);
}

module.exports = router;

const config = require("config");
const jsonwebtoken = require('jsonwebtoken');
const authutils = require("../src/authutils");
const { User } = require("../models/user");

/**
 * Custom JWT strategy middleware for verifying the token (instead of e.g. passport-jwt)
 * auth - middleware
 * @param {*} req.headers.authorization - JWT Bearer token
 * @param {*} res 
 * @param {*} next 
 * @returns res.status 200 - authorized with user object in req.user
 * 					res.status 400 - bad reqeust
 * 					res.status 401 - unauthorized
 */
module.exports = function (req, res, next) {

	if (!config.get("requiresAuth")) return next();

	// console.log(req.headers);

	if (!req.headers.authorization) {
		return res.status(400).json({ success: false, msg: "Bad request" });
	}
	const tokenParts = req.headers.authorization.split(' ');
	// console.log(tokenParts);

	// Expected token?
	if (tokenParts[0] === 'Bearer' && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
		try {
			// RS256 (RSASHA256) algorithm option with public key
			const verification = jsonwebtoken.verify(tokenParts[1], authutils.PUB_KEY, { algorithms: ['RS256'] });

			User.findById(verification.sub)
				.then((user) => {
					if (!user)
						return res.status(401).json({ success: false, msg: "You are not authorized" });

					// Save user object to the request
					req.user = user;

					next();
				})
				.catch((err) => {
					return res.status(401).json({ success: false, msg: "You are not authorized" });
				});
		}
		catch (err) {
			res.status(401).json({ success: false, msg: "You are not authorized" });
		}
	} else {
		// Bad request - unsupported or missing token
		res.status(400).json({ success: false, msg: "You are not authorized" });
	}

}
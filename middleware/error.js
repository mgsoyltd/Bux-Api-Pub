const winston = require("winston");

module.exports = function (err, req, res, next) {
	winston.error(err.message);

	// Internal server error
	res.status(500).send("Something failed.");
};

const config = require("config");

module.exports = function () {
	if (!config.get("jwtPrivateKey")) {
		throw new Error("FATAL ERROR: JWT is not defined.");
	}
	if (!config.get("db")) {
		throw new Error("FATAL ERROR: Database is not defined.");
	}
};

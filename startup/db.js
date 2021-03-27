const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
	const db = config.get("db");
	mongoose.connect(db,
		{
			useFindAndModify: false,		// continue using findOneAndUpdate()
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
		.then(() => winston.info(`Connected to ${db}...`))
		.catch(err => winston.error(err));
};

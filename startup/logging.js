require("express-async-errors");
const { level } = require("winston");
const winston = require("winston");

module.exports = function () {
	// const console = new winston.transports.Console();
	const console = new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.prettyPrint()
		),
	});
	const files = new winston.transports.File({
		filename: "logfile.log",
		level: "error",
	});

	const exceptions = new winston.transports.File({
		filename: "uncaughtExceptions_log.json",
	});
	const ex_console = new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.prettyPrint()
		),
	});
	winston
		.clear() // Remove all transports
		.add(console) // Add console transport
		.add(files) // Add file transport
		// .add(mongodb) // Add MongoDB transport
		.exceptions.handle(ex_console, exceptions);

	process.on("unhandledRejection", (ex) => {
		throw ex;
	});

	// process.on("uncaughtException", (ex) => {
	// 	winston.error(ex.message, ex);
	// 	process.exit(1);
	// });
};

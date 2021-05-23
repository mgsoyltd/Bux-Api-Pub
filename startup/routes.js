const express = require("express");
const fileUpload = require('express-fileupload');
const auth = require("../routes/auth");
const users = require("../routes/users");
const books = require("../routes/books");
const readings = require("../routes/readings");
const error = require("../middleware/error");

module.exports = function (app) {
	app.use(express.json());
	app.use(fileUpload({
		limits: { fileSize: 20 * 512 * 512 },		// Image file upload size limit
	}));
	app.use("/api/auth", auth);
	app.use("/api/users", users);
	app.use("/api/books", books);
	app.use("/api/readings", readings);
	app.use(error);
};

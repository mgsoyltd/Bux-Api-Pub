const express = require("express");
const fileUpload = require('express-fileupload');
const auth = require("../routes/auth");
const users = require("../routes/users");
const books = require("../routes/books");
const readings = require("../routes/readings");
const error = require("../middleware/error");
const gallery = require("../routes/gallery");

module.exports = function (app) {
	app.use(express.json());

	// Allow cross-origin requests
	// app.use(function (req, res, next) {
	// 	console.log("ORIGIN");
	// 	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
	// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// 	next();
	// });

	app.use(fileUpload({
		limits: { fileSize: 20 * 512 * 512 },		// Image file upload size limit
	}));
	app.use("/api/auth", auth);
	app.use("/api/users", users);
	app.use("/api/books", books);
	app.use("/api/readings", readings);
	app.use(express.static(global.appRoot + '/public'));
	app.use("/images", express.static('images'));
	app.use("/gallery", gallery);
	app.use(error);
};

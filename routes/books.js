const _ = require("lodash");
const express = require("express");
const router = express.Router();
const sharp = require("sharp");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const { validateKey } = require("../middleware/apikeys");
const { Books, validate } = require("../models/books");
const utils = require("../src/utils");

router.get("/", [validateKey, auth], async (req, res) => {

	// query: { '$expand': '*' }
	// query: { '$expand': 'readings,users' }

	if (req.query.hasOwnProperty("$expand")) {
		const coll = req.query["$expand"].split(',');
		if (coll.includes('*') || (coll.includes('readings') && coll.includes('users'))) {
			const expandAll =
				[
					{
						"$sort": {
							"pages": 1
						}
					},
					{
						"$lookup": {
							"from": "readings",
							"as": "readings_data",
							"let": { "booksId": "$_id" },
							"pipeline": [
								{ "$match": { "$expr": { "$eq": ["$books_id", "$$booksId"] } } },
								{
									"$lookup": {
										"from": "users",
										"let": { "usersId": "$users_id" },
										"as": "users_data",
										"pipeline": [
											{ "$match": { "$expr": { "$eq": ["$_id", "$$usersId"] } } }
										]
									}
								}
							]
						}
					}
				];
			const books = await Books.aggregate(expandAll);
			return res.send(books);
		}
		else if (coll.includes('readings')) {
			const expandReadings =
				[
					{
						"$sort": {
							"pages": 1
						}
					},
					{
						"$lookup": {
							"from": "readings",
							"as": "readings_data",
							"let": { "booksId": "$_id" },
							"pipeline": [
								{ "$match": { "$expr": { "$eq": ["$books_id", "$$booksId"] } } }
							]
						}
					}
				];
			const books = await Books.aggregate(expandReadings);
			return res.send(books);
		}
		else {
			return res.status(400).send("Bad Request");
		}
	}
	else if (Object.keys(req.query).length !== 0) {
		return res.status(400).send("Bad Request");
	}

	// Get all 
	const books = await Books.find().sort("title");
	res.send(books);
});

// Create a new book
router.post("/", [validateKey, auth], async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let book = await Books.findOne({ ISBN: req.body.ISBN });
	if (book) return res.status(400).send("Book already registered.");

	book = new Books(_.pick(req.body, ["title", "author", "ISBN", "description", "pages", "imageURL"]));
	try {
		// Save to DB
		await book.save();
		res.send(book);

	} catch (ex) {
		return res.status(400).send(ex.message);
	}
});

// Get single book by ID
// Endpoint: /<objectid>
// Body: <book object> 
router.get("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	const book = await Books.findById(req.params.id).select("-__v");

	if (!book)
		return res.status(404).send("The book with the given ID was not found.");

	res.send(book);
});

// Update book by ID
// Endpoint: /<objectid>
// Body: <book object> 
router.put("/:id", [validateKey, auth, validateObjectId], async (req, res) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const book = await Books.findByIdAndUpdate(
		req.params.id,
		{
			title: req.body.title,
			author: req.body.author,
			description: req.body.description,
			pages: req.body.pages,
			imageURL: req.body.imageURL
		},
		{
			new: true,
		}
	);
	res.send(book);
});

// Update book's image file 
// Endpoint: /<objectid>
// Body form-data: file: <uploadfile>
router.post("/upload/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}

	const fileData = req.files.file;
	const fileName = fileData.name.toLowerCase();
	const ext = utils.getExtension(fileName);
	if (!utils.isImage(fileName)) {
		return res.status(400).send(`Unsupported image file type: ${ext}`);
	}

	if (fileData.truncated === true) {
		return res.status(400).send(`Image file size (${fileData.size}) exceeds the limit.`);
	}

	// Upload an image into img object
	let contentType = fileData.mimetype;
	if (contentType == undefined) {
		contentType = 'image/' + utils.getExtension(fileName);
	}

	// console.log(fileData);
	console.log("filename:", fileName, "extention:", ext, "mimetype:", contentType);

	const imagePath = '/public/images/';
	const imageUrl = `${req.connection.encrypted ? "https" : "http"}://${req.headers.host}/images/${fileName}`;
	const filePath = global.appRoot + imagePath + fileName;
	// console.log(imageUrl);
	// console.log(filePath);

	// // Move image file without conversion
	// fileData.mv(global.appRoot + imagePath + fileName, function (err) {
	// 	if (err) {
	// 		return res.status(400).send(err);
	// 	} else {
	// 		console.log(`Image uploaded successfully to ${imageUrl}`);
	// 	}
	// });

	// Resize the image
	sharp(fileData.data)
		.resize(512)
		.toFormat("jpeg")
		.toFile(filePath, (err, info) => {
			if (err) {
				return res.status(400).send(err);
			} else {
				console.log(`Image uploaded successfully to ${imageUrl}`);
			}
		});

	const book = await Books.findById(req.params.id).select("-__v");
	if (!book)
		return res.status(404).send("The book with the given ID was not found.");

	// Update the imageURL on the book
	book.imageURL = imageUrl;

	book.save((error, savedBook) => {
		if (error) {
			return res.status(404).send(error.details[0].message);
		}
		return res.status(200).send(`${imageUrl}`);
	});

});

// Delete a book
router.delete("/:id", [validateKey, auth, admin, validateObjectId], async (req, res) => {
	const book = await Books.findByIdAndRemove(req.params.id);

	if (!book)
		return res.status(404).send("The book with the given ID was not found.");

	res.send(book);
});

module.exports = router;

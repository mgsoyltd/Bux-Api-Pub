const express = require("express"); const { Timestamp } = require("mongodb");
const router = express.Router();
const _ = require("lodash");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
const { validateKey } = require("../middleware/apikeys");
const { Readings, validate } = require("../models/readings");
const Mongoose = require("mongoose");

/**
 * Get readings
 * 	query: { '$expand': '*' } - Optional expand query to include user dimension
 */
router.get("/", [validateKey, auth], async (req, res) => {

	if (req.query.hasOwnProperty("$expand")) {
		const coll = req.query["$expand"].split(',');
		if (coll.includes('*')) {
			const userId = new Mongoose.Types.ObjectId(req.user._id);
			const expandAll =
				[
					{
						$match: {
							users_id: userId
						}
					},
					{
						"$sort": {
							"updatedAt": -1
						}
					},
					{
						"$lookup": {
							"from": "books",
							"localField": "books_id",
							"foreignField": "_id",
							"as": "books_data"
						}
					},
					{
						"$unwind": {
							"path": "$books_data",
							"preserveNullAndEmptyArrays": true
						}
					},
					{
						"$lookup": {
							"from": "users",
							"localField": "users_id",
							"foreignField": "_id",
							"as": "users_data"
						}
					},
					{
						"$unwind": {
							"path": "$users_data",
							"preserveNullAndEmptyArrays": true
						}
					}
				];
			const readings = await Readings.aggregate(expandAll);
			res.send(readings);
		}
		else {
			return res.status(400).send("Bad Request");
		}
	}
	else if (Object.keys(req.query).length !== 0) {
		return res.status(400).send("Bad Request");
	}
	else {
		// Get all for current user 
		const userId = new Mongoose.Types.ObjectId(req.user._id);
		const filter =
			[
				{
					$match: {
						users_id: userId
					}
				},
				{
					"$sort": {
						"updatedAt": -1
					}
				}
			];
		const readings = await Readings.aggregate(filter);
		res.send(readings);
	}
	// else {
	// 	// Get all for admin
	// 	const readings = await Readings.find().sort({ "updatedAt": -1 });
	// 	res.send(readings);
	// }
});

/**	
 * Post a reading
 */
router.post("/", [validateKey, auth], async (req, res) => {

	req.body.users_id = req.user._id.toString();		// Current user
	// console.log("<<POST READING>>", req.body);
	const { error } = validate(req.body);
	if (error) {
		console.log(error);
		return res.status(400).send(error.details[0].message);
	}

	let readings = await Readings.findOne({ books_id: req.body.books_id, books_id: req.body.users_id });
	if (readings) return res.status(400).send("Reading already registered.");

	readings = new Readings(_.pick(req.body,
		[
			"users_id",
			"books_id",
			"current_page",
			"time_spent",
			"rating",
			"comments"
		]));
	console.log("<<POST READING>>", readings);
	try {
		// Save to DB
		// console.log("<<POST READING>>", readings);
		await readings.save();
		res.send(readings);

	} catch (ex) {
		console.log("<<<POST ERROR>>>", ex.message);
		return res.status(400).send(ex.message);
	}
});

/**	
 * Get a single reading
 */
router.get("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	if (req.query.hasOwnProperty("$expand")) {
		const coll = req.query["$expand"].split(',');
		if (coll.includes('*')) {
			const readingId = new Mongoose.Types.ObjectId(req.params.id);
			const userId = new Mongoose.Types.ObjectId(req.user._id);
			const expandAll =
				[
					{
						$match: {
							_id: readingId,
							users_id: userId
						}
					},
					{
						"$sort": {
							"updatedAt": -1
						}
					},
					{
						"$lookup": {
							"from": "books",
							"localField": "books_id",
							"foreignField": "_id",
							"as": "books_data"
						}
					},
					{
						"$unwind": {
							"path": "$books_data",
							"preserveNullAndEmptyArrays": true
						}
					},
					{
						"$lookup": {
							"from": "users",
							"localField": "users_id",
							"foreignField": "_id",
							"as": "users_data"
						}
					},
					{
						"$unwind": {
							"path": "$users_data",
							"preserveNullAndEmptyArrays": true
						}
					}
				];
			const readings = await Readings.aggregate(expandAll);
			res.send(readings);
		}
		else {
			return res.status(400).send("Bad Request");
		}
	}
	else if (Object.keys(req.query).length !== 0) {
		return res.status(400).send("Bad Request");
	}
	else {
		// Get non-expanded view
		// Filter reading by current user
		const readingId = new Mongoose.Types.ObjectId(req.params.id);
		const userId = new Mongoose.Types.ObjectId(req.user._id);
		const filter =
			[
				{
					$match: {
						_id: readingId,
						users_id: userId
					}
				},
				{
					"$sort": {
						"updatedAt": -1
					}
				}
			];
		const readings = await Readings.aggregate(filter);
		if (!readings)
			return res.status(404).send("The readings with the given ID was not found.");

		res.send(readings);
	}

});

/**	
 * Update a single reading
 */
router.put("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	req.body.users_id = req.user._id.toString();		// Current user
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const readings = await Readings.findByIdAndUpdate(
		req.params.id,
		{
			current_page: req.body.current_page,
			time_spent: req.body.time_spent,
			rating: req.body.rating,
			comments: req.body.comments
		},
		{
			new: true,
		}
	);

	if (!readings)
		return res.status(404).send("The readings with the given ID was not found.");

	res.send(readings);
});

/**	
 * Delete a single reading
 */
router.delete("/:id", [validateKey, auth, validateObjectId], async (req, res) => {

	const readings = await Readings.findByIdAndRemove(req.params.id);

	if (!readings)
		return res.status(404).send("The readings with the given ID was not found.");

	res.send(readings);
});

module.exports = router;

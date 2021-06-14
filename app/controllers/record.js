const mongoose = require("mongoose");
const {Record} = require("../models");

/** Create and Save a new Record */
exports.create = async (req, res) => {
	const draft = req.body;
	if (!draft) {
		res.status(400).send({
			message: "Some error occurred while creating the Record."
		});
	}
	// TODO: Validate request
	// Create a Record
	const record = new Record({
			type: draft.type,
			name: draft.name,
			balance: draft.balance
		});

	// Save Record in the database
	try {
		const data = await record.save(record);
		res.send(data);
	} catch (err) {
		res.status(500).send({
			message: err.message || "Some error occurred while creating the Record."
		});
	}
};

/** Retrieve all Records from the database. */
exports.findAll = async (req, res) => {
	// TODO: support pagination.
	// TODO: sort
	const records = await Record.find({});
	res.send(records);
};


function isMongooseId(id) {
	return id && mongoose.isValidObjectId(id);
}

/** Gets a single Record with an id */
exports.findOne = async (req, res) => {
	try {
		const {id} = req.params;
		// Validate id format
		if (!isMongooseId(id)) {
			// invalid request
			res.status(400).send({
				message: "Invalid id format"
			});
			return;
		}
		// Read record
		const record = await Record.findById(id);
		if (record) {
			res.send(record);
			return;
		}
		// Record not found
		res.status(404).send({
			message: "Record not found"
		});
	} catch (err) {
		res.status(404).send({
			message: "Record not found"
		});
	}
};

/** Updates a Record by the id in the request */
exports.update = async (req, res) => {
	const {id} = req.params;
	try {
		// Validate
		if (!isMongooseId(id)) {
			// invalid request
			res.status(400).send({
				message: "Invalid id format"
			});
			return;
		}
		const update = req.body;
		if (!update) {
			res.status(400).send({
				message: "Invalid update request"
			});
			return;
		}
		// TODO: validate user has access to modify this record
		let record = await Record.findById(id);
		if (!record) {
			res.status(404).send({
				message: `Cannot update Record with id=${id}.`
			});
			return;
		}
		// make changes to record
		for (const prop in update) {
			if (update.hasOwnProperty(prop)) record[prop] = update[prop];
		}
		record = await record.save();
		if (record) {
			res.send({message: `Record id=${id} was updated successfully.`});
			return;
		}
		res.status(404).send({
			message: `Cannot update Record with id=${id}.`
		});
	} catch (err) {
		res.status(500).send({
			message: `Error updating Record with id=${id}.`
		});
	}
};

/** Deletes a Record with the specified id in the request */
exports.delete = async (req, res) => {
	const {id} = req.params;
	try {
		if (!isMongooseId(id)) {
			// invalid request
			res.status(400).send({
				message: "Invalid id format"
			});
			return;
		}
		// TODO: validate user has access to modify this record
		const record = await Record.findByIdAndRemove(id);
		if (record) {
			res.send({
				message: `${id} was deleted successfully!`
			});
			return;
		}
		// Record not found.
		res.status(404).send({
			message: `Cannot delete Record with id=${id}.`
		});
	} catch (err) {
		res.status(500).send({
			message: `Could not delete Record with id=${id}.`
		});
	}
};

/** Gets the summary of net worth, total assets, total liabilities. */
exports.summary = async (req, res) => {
	const {user_id} = req.params,
		data = req.body;
	const result = await Record.aggregate([
		{$match: {}}, // TODO: filter by user that own the record, leverage an index
		{$group:
			{
				_id: null,
				total_asset: {
					$sum: {
						$cond: [
							{$eq: ["$type", "asset"]},
							"$balance",
							0
						]
					}
				},
				total_liability: {
					$sum: {
						$cond: [
							{$eq: ["$type", "liability"]},
							"$balance",
							0
						]
					}
				}
			}
		},
		{$addFields: {
			net_worth: {$subtract: ["$total_asset", "$total_liability"]}
		}},
		{$addFields: {
			net_worth_double: {$toDouble: "$net_worth"},
			total_asset_double: {$toDouble: "$total_asset"},
			total_liability_double: {$toDouble: "$total_liability"}
		}}
	]);
	console.debug(result);
	const summary = result[0];
	res.send({
		net_worth: (summary) ? summary.net_worth_double : 0,
		total_asset: (summary) ? summary.total_asset_double : 0,
		total_liability: (summary) ? summary.total_liability_double : 0
	});
};
const mongoose = require("mongoose");
const {User} = require("../models");

/** Create and Save a new User */
exports.create = async (req, res) => {
	const draft = req.body;
	if (!draft) {
		res.status(400).send({
			message: "Some error occurred while creating the User."
		});
	}
	// Validate request
	if (!draft.firstName) {
		res.status(400).send({message: "First name is required!"});
		return;
	}
	if (!draft.lastName) {
		res.status(400).send({message: "Last name is required!"});
		return;
	}
	if (!draft.email) {
		res.status(400).send({message: "Email is required!"});
		return;
	}

	// Create a User
	const user = new User({
			firstName: draft.firstName,
			lastName: draft.lastName,
			email: draft.email
		});

	// Save User in the database
	try {
		const data = await user.save(user);
		res.send(data);
	} catch (err) {
		res.status(500).send({
			message: err.message || "Some error occurred while creating the User."
		});
	}
};

/** Retrieve all Users from the database. */
exports.findAll = async (req, res) => {
	// TODO: support pagination.
	// TODO: sort
	const users = await User.find({});
	res.send(users);
};


function isMongooseId(id) {
	return id && mongoose.isValidObjectId(id);
}

/** Gets a single User with an id */
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
		// Read user
		const user = await User.findById(id);
		if (user) {
			res.send(user);
			return;
		}
		// User not found
		res.status(404).send({
			message: "User not found"
		});
	} catch (err) {
		res.status(404).send({
			message: "User not found"
		});
	}
};

/** Updates a User by the id in the request */
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
		// TODO: validate user has access to modify this user
		let user = await User.findById(id);
		if (!user) {
			res.status(404).send({
				message: `Cannot update User with id=${id}.`
			});
			return;
		}
		// make changes to user
		for (const prop in update) {
			if (update.hasOwnProperty(prop)) user[prop] = update[prop];
		}
		user = await user.save();
		if (user) {
			res.send({message: `User ${user.fullName} was updated successfully.`});
			return;
		}
		res.status(404).send({
			message: `Cannot update User with id=${id}.`
		});
	} catch (err) {
		res.status(500).send({
			message: `Error updating User with id=${id}.`
		});
	}
};

/** Deletes a User with the specified id in the request */
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
		// TODO: validate user has access to modify this user
		const user = await User.findByIdAndRemove(id);
		if (user) {
			res.send({
				message: `${user.fullName} was deleted successfully!`
			});
			return;
		}
		// User not found.
		res.status(404).send({
			message: `Cannot delete User with id=${id}.`
		});
	} catch (err) {
		res.status(500).send({
			message: `Could not delete User with id=${id}.`
		});
	}
};
/** Record model */
module.exports = (mongoose) => {
	const recordSchema = new mongoose.Schema({
		name: { // Record name
			type: String,
			required: true
		},
		type: {
			type: String,
			enum : ["asset", "liability"],
			required: true
		},
		balance: { // Stored as pennies
			type: Number,
			default: 0
		}
	}, {
		collection: "Record",
		timestamps: true
	});

	// Methods

	/** Gets the record formatted in JSON format.
	 * @ret {object} Record in JSON format. */
	recordSchema.method("toJSON", function() {
		const {__v, _id, ...object} = this.toObject();
		object.id = _id;
		// Convert balance from pennies to dollars
		object.balance = object.balance / 100;
		return object;
	});

	// Indexes
	// TODO: add indexes on user
	return mongoose.model("Record", recordSchema);
};
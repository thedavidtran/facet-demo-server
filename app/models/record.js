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
		balance: {
			type: mongoose.Decimal128,
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
		return object;
	});

	// Indexes
	// TODO: add indexes on user
	return mongoose.model("Record", recordSchema);
};
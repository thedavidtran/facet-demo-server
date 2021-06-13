/** User model */
module.exports = (mongoose) => {
	const userSchema = new mongoose.Schema({
			firstName: { // User's first name
				type: String,
				required: true,
				minLength: 2
			},
			lastName: { // User's last name
				type: String,
				required: true,
				minLength: 2
			},
			email: { // User's email address
				type: String,
				required: true
			}
		}, {
			collection: "User",
			timestamps: true
		});

	// Virtual

	userSchema.virtual("fullName").get(function() {
		return `${this.firstName} ${this.lastName}`;
	});

	// Methods

	/** Gets the user formatted in JSON format.
	 * @ret {object} User in JSON format. */
	userSchema.method("toJSON", function() {
		const {__v, _id, ...object} = this.toObject();
		object.id = _id;
		return object;
	});

	// Indexes
	userSchema.index({email: 1}, {unique: true}); // Uniqueness constraint on email

	return mongoose.model("User", userSchema);
};
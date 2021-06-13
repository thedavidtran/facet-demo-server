const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

module.exports = {
	mongoose: mongoose,
	// Models
	User: require("./user.js")(mongoose)
};
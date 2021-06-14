const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

module.exports = {
	mongoose: mongoose,
	// Models
	Record: require("./record.js")(mongoose)
};
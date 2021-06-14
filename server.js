const express = require("express");
const cors = require("cors");
const {corsConfig, dbConfig} = require("./config.js");
const app = express();

// initialize cors
app.use(cors(corsConfig));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// root route
app.get("/", (req, res) => {
	res.json({message: "Initial deployment on heroku."});
});

// bind routes
require("./app/routes/user")(app);
require("./app/routes/record")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

/** Initialize db connection.
 * @ret {Promise} Resolves upon database connection, otherwise end server process. */
async function initDb() {
	const db = require("./app/models");
	try {
		await db.mongoose.connect(dbConfig.url, dbConfig.options);
		console.log("Connected to the database!");
	} catch (err) {
		console.error("Cannot connect to the database!", err);
		process.exit();
	}
}

initDb();
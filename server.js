const express = require("express");
const cors = require("cors");
const {corsConfig} = require("./config.js");
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

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
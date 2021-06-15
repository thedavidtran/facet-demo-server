module.exports = (app) => {
	const records = require("../controllers/record.js"),
		router = require("express").Router();

	// Get summary of net worth, total assets, total liabilities
	router.get("/", records.summary);

	app.use("/api/summary", router);
};
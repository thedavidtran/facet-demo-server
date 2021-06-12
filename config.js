/** Environment configurations. */
const DEFAULT_MONGODB_URI = "mongodb+srv://admin:admin@facet-east.dipeq.mongodb.net/facet?retryWrites=true&w=majority";
module.exports = {
	corsConfig: { // cors library
		origin: "http://localhost:8081"
	},
	dbConfig: { // configuration for MongoDB atlas cluster
		url: process.env.MONGODB_URI || DEFAULT_MONGODB_URI,
		options: {
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	}
};
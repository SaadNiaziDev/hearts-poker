const mongoose = require("mongoose");
const MONGODB_URI = require("./config").MONGODB_URI;
let isProduction = process.env.NODE_ENV === "production";

mongoose
	.connect(`${MONGODB_URI}?retryWrites=false`, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useFindAndModify: false,
		// useCreateIndex: true,
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	})
	.then(() => {
		console.log(`connected to db in ${isProduction ? "Prod" : "Dev"} environment`);
		init();
	});

const defaultUser = require("./seeder/defaultUser");
const feedConfig = require("./seeder/configuration");
// const createTables = require("./seeder/tables");

async function init() {
	console.log("dropping DB");
	await mongoose.connection.db.dropDatabase();
	await defaultUser();
	await feedConfig();

	exit();
}

function exit() {
	console.log("exiting");
	process.exit(1);
}

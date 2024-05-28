let express = require("express");
const mongoose = require("mongoose");
const Game = require("./server/models/Game");

require("dotenv").config();

// Create global app object
let app = express();
var allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5000",
	"http://localhost:8000",
	"http://3.87.232.122",
	"https://steamcommunity.com",
	"https://moralis.com",
];

require("./server/app-config")(app);

// finally, let's start our server...
let server = app.listen(process.env.PORT || 8000, function () {
	console.log("Listening on port " + server.address().port);
});

global.heartsPokerSocket = require("socket.io")(server, {
	cors: {
		credentials: true,
		origin: function (origin, callback) {
			// allow requests with no origin
			// (like mobile apps or curl requests)
			// console.log("ORIGIN", origin);
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				var msg = "The CORS policy for this site does not " + "allow access from the specified Origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
	},
});

heartsPokerSocket.on("connection", (socket) => {
	console.log("user connected!", socket.id);
	socket.on("disconnect", () => {
		Game.findOneAndUpdate(
			{ "players.socket": socket.id, currentRound: { $ne: "showdown" } },
			{ $set: { "players.$[elem].isDisconnected": true } },
			{ arrayFilters: [{ "elem.socket": socket.id }], new: true }
		)
			.then((item) => {
				if (item) {
					heartsPokerSocket.emit(`table-${item.id}-data-changed`, item);
				}
			})
			.catch((error) => {
				console.error(error);
			});
	});
	socket.on("player-reconnected", (args) => {
		Game.findById(args.table).then(async (result) => {
			if (result) {
				let index = result.players.findIndex((player) => player.pid.toString() === args.player);
				result.players[index].isDisconnected = false;
				await result.save();
				heartsPokerSocket.emit(`table-${result.id}-data-changed`, result);
			}
		});
	});
});

process.on("SIGTERM", () => {
	console.info("SIGTERM signal received.");
	console.log("Closing http server.");

	server.close(() => {
		console.log("Http server closed.");
		// boolean means [force], see in mongoose doc
		mongoose.connection.close(false).then(() => {
			console.log("MongoDb connection closed.");
			process.kill(process.pid, "SIGTERM");
			process.exit(0);
		});
	});
});
process.once("SIGUSR2", function () {
	server.close(() => {
		console.log("Http server closed.");
		// boolean means [force], see in mongoose doc
		mongoose.connection.close(false).then(() => {
			console.log("MongoDb connection closed.");
			process.kill(process.pid, "SIGUSR2");
			process.exit(0);
		});
	});
});

process.on("SIGINT", function () {
	// this is only called on ctrl+c, not restart
	server.close(() => {
		console.log("Http server closed.");
		// boolean means [force], see in mongoose doc
		mongoose.connection.close(false).then(() => {
			console.log("MongoDb connection closed.");
			process.kill(process.pid, "SIGINT");

			process.exit(0);
		});
	});
});

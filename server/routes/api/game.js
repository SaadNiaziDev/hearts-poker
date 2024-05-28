let mongoose = require("mongoose");
let router = require("express").Router();
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
const Game = require("../../models/Game");
const auth = require("../auth");
const { request } = require("express");

router.get("/", async (req, res, next) => {
	// let options = {
	// 	page: req.query.page || 1,
	// 	limit: req.query.limit || 100,
	// };
	// Game.paginate({}, options, (err, data) => {
	// 	if (err || !data) return next(new BadRequestResponse(err));
	// 	else return next(new OkResponse(data));
	// });
	Game.find({ currentRound: { $ne: "showdown" } }, (err, data) => {
		if (err || !data) return next(new BadRequestResponse(err));
		else return next(new OkResponse(data));
	});
});

router.post("/create", auth.isToken, auth.user, async (req, res, next) => {
	const { name, maxPlayers, visibility, fee } = req.body;
	if (!name || !maxPlayers || !fee) return next(new BadRequestResponse("Incomplete details to create a new table!"));
	let table = new Game({
		name: name,
		host: req.user?.walletAddress,
		maxPlayers: maxPlayers,
		visibility: visibility,
		fees: fee,
	});
	table.save((err, data) => {
		if (err) return new BadRequestResponse(err);
		heartsPokerSocket.emit("new-table-created", data);
		return next(new OkResponse(table));
	});
});

router.get("/join-table/:id/:socket", auth.isToken, auth.user, async (req, res, next) => {
	const { id, socket } = req.params;
	if (!id) return next(new BadRequestResponse("Table not found!"));
	Game.findById(id, async (err, data) => {
		if (err || !data) return next(new BadRequestResponse("No table found"));
		if (data.players.some((player) => player.pid.toString() === req.user.id.toString())) {
			let index = data.players.findIndex((player) => player.pid.toString() === req.user.id);
			data.players[index].isDisconnected = false;
			if (socket) {
				data.players[index].socket = socket;
			}
			await data.save();
			return next(new OkResponse("Player Already exists!"));
		}
		if (data.players.length < data.maxPlayers) {
			if (req.user?.balance >= data.fees) {
				req.user.balance -= data.fees;
				await req.user.save();
				data.addPlayer(req.user._id, req.user.walletAddress, data.fees, socket);
				await data.save((err, result) => {
					if (err) return next(new BadRequestResponse(err));
					heartsPokerSocket.emit("table-data-changed", result);
					heartsPokerSocket.emit(`new-player-join-table-${id}`, { username: req.user?.walletAddress, game: result });
					next(new OkResponse("Table is open"));
				});
			} else {
				return next(new BadRequestResponse("Insufficient Balance"));
			}
		} else {
			return next(new BadRequestResponse("Table is full!"));
		}
	});
});

router.post("/context", auth.isToken, auth.user, (req, res, next) => {
	Game.findById(req.body.id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't find game"));
		return next(new OkResponse(game));
	});
});

router.get(`/start-game/:id`, auth.isToken, auth.user, (req, res, next) => {
	const { id } = req.params;
	Game.findById(id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't locate game"));
		game.startRound();
		game.save((err, result) => {
			if (err || !result) return next(new BadRequestResponse("Couldn't exit game!"));
			heartsPokerSocket.emit(`table-${id}-start`, result);
			heartsPokerSocket.emit(`table-data-changed`, result);
			return next(new OkResponse("Game has been started"));
		});
	});
});

router.post(`/make-bet`, auth.isToken, auth.user, (req, res, next) => {
	const { id, amount, socket } = req.body;
	if (!id || !amount) return next(new BadRequestResponse("Bet Amount is required!"));
	Game.findById(id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't locate game"));
		game.raiseBet(amount);
		if (socket) {
			let index = game.players.findIndex((player) => player.pid.toString() === req.user.id.toString());
			game.players[index].socket = socket;
		}
		game.save((err, result) => {
			if (err || !result) return next(new BadRequestResponse("Couldn't make bet!"));
			heartsPokerSocket.emit(`table-${id}-data-changed`, result);
			heartsPokerSocket.emit(`table-data-changed`, result);
			return next(new OkResponse("Bet has been placed"));
		});
	});
});

router.get(`/make-call/:id/:socket`, auth.isToken, auth.user, (req, res, next) => {
	const { id, socket } = req.params;
	if (!id) return next(new BadRequestResponse("Game Id is required!"));
	Game.findById(id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't locate game"));
		game.call();
		if (socket) {
			let index = game.players.findIndex((player) => player.pid.toString() === req.user.id.toString());
			game.players[index].socket = socket;
		}
		game.save((err, result) => {
			if (err || !result) return next(new BadRequestResponse("Couldn't make bet!"));
			heartsPokerSocket.emit(`table-${id}-data-changed`, result);
			heartsPokerSocket.emit(`table-data-changed`, result);
			return next(new OkResponse("Bet has been placed"));
		});
	});
});

router.get(`/make-check/:id/:socket`, auth.isToken, auth.user, (req, res, next) => {
	const { id, socket } = req.params;
	if (!id) return next(new BadRequestResponse("Game ID is required!"));
	Game.findById(id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't locate game"));
		game.check();
		if (socket) {
			let index = game.players.findIndex((player) => player.pid.toString() === req.user.id.toString());
			game.players[index].socket = socket;
		}
		game.save((err, result) => {
			if (err || !result) return next(new BadRequestResponse("Couldn't make bet!"));
			heartsPokerSocket.emit(`table-${id}-data-changed`, result);
			heartsPokerSocket.emit(`table-data-changed`, result);
			return next(new OkResponse("Bet has been placed"));
		});
	});
});

router.get("/leave-game/:id", auth.isToken, auth.user, (req, res, next) => {
	const { id } = req.params;
	Game.findById(id, (err, game) => {
		if (err || !game) return next(new BadRequestResponse("Couldn't locate game"));

		let left_player = game.players.findIndex((item) => item.pid.toString() === req.user.id.toString());
		if (left_player !== -1) {
			game.players[left_player].didLeft = true;
			game.save((err, result) => {
				if (err || !result) return next(new BadRequestResponse("Couldn't exit game!"));
				heartsPokerSocket.emit(`table-${id}-player-exit`, { username: req.user?.walletAddress, game: result });
				heartsPokerSocket.emit(`table-data-changed`, result);
				return next(new OkResponse("Exited gracefully!"));
			});
		} else {
			return next(new BadRequestResponse("Something went wrong!"));
		}
	});
});

module.exports = router;

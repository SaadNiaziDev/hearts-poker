const router = require("express").Router();
const { BadRequestResponse, OkResponse } = require("express-http-response");
const Chat = require("../../models/Chat");
const auth = require("../auth");

router.get("/general", (req, res, next) => {
	Chat.findOne({ type: "general" }, (err, chat) => {
		if (err || !chat) return next(new BadRequestResponse("No record found!"));
		return next(new OkResponse(chat));
	});
});

router.get("/game/:id", (req, res, next) => {
	if (!req.params.id) return next(new BadRequestResponse("Missing required id!"));
	Chat.findOne({ gameId: req.params.id }, (err, chat) => {
		if (err || !chat) return next(new BadRequestResponse("No record found!"));
		return next(new OkResponse(chat));
	});
});

router.post("/add", auth.isToken, auth.user, (req, res, next) => {
	Chat.findOne({ type: req.body.type, gameId: req.body.gameId }, (err, chat) => {
		if (err) return next(new BadRequestResponse("No record found!"));
		if (!chat) {
			let newchat = new Chat({
				type: req.body.type,
			});
			if (req.body.gameId) newchat.gameId = req.body.gameId;
			newchat.messages.push({
				sender: req.user?.walletAddress,
				message: req.body.message,
			});
			newchat.save((err, done) => {
				console.log(err);
				if (err) return next(new BadRequestResponse("Error saving new chat"));
				heartsPokerSocket.emit("message", newchat.messages);
				return next(new OkResponse("OK"));
			});
		} else {
			chat.messages.push({
				sender: req.user?.walletAddress,
				message: req.body.message,
			});
			chat.save((err, done) => {
				if (err) return next(new BadRequestResponse("Error saving"));
				heartsPokerSocket.emit("message", chat.messages);
				return next(new OkResponse("OK"));
			});
		}
	});
});

module.exports = router;

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
	type: {
		type: String,
		enum: ["ingame", "general"],
		default: "general",
	},
	gameId: { type: mongoose.Schema.Types.ObjectId, ref: "game" },
	messages: [
		{
			sender: {
				type: String,
				required: true,
			},
			message: {
				type: String,
				required: true,
			},
		},
	],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;

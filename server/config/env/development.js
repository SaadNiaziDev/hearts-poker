"use strict";
module.exports = {
	backend: "http://localhost:8000",
	frontend: "http://localhost:3000",
	publicPics: "http://localhost:8000/uploads/publicPics",
	PORT: 8000,
	MONGODB_URI: "mongodb://0.0.0.0:27017/heart-poker",
	secret: "secret",
	host: "",
	smtpAuth: {
		user: "KEY_HERE",
		pass: "KEY_HERE",
	},
	moralis_api: "KEY_HERE",
	steamKey: "KEY_HERE",
	twitchClientID: "KEY_HERE",
	twitchClientSecretKey: "KEY_HERE",
	allowedOrigins: ["http://localhost:3000", "http://localhost:5000", "http://localhost:8000"],
};

let mongoose = require("mongoose");
let router = require("express").Router();
let fetch = require("node-fetch");
let passport = require("passport");
let User = mongoose.model("User");
let auth = require("../auth");
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
let { sendEmail } = require("../../utilities/mailer");
let jwt = require("jsonwebtoken");
const { bufferToHex } = require("ethereumjs-util");
const { recoverPersonalSignature } = require("eth-sig-util");

const htmlPage =
	'<html><head><title>Main</title></head><body></body><script defer >res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>';

router.use(passport.initialize());
router.use(passport.session());

router.get("/context", auth.isToken, (req, res, next) => {
	req.session.username = req.user.username;
	return next(new OkResponse(req.user));
});

router.get("/logout", (req, res, next) => {
	try {
		req.logout((err) => {
			if (err) return next(new BadRequestResponse(err));
			req.session.destroy();
			return next(new OkResponse("Ok"));
		});
	} catch (error) {
		return next(new BadRequestResponse(error));
	}
});

router.post("/login", (req, res, next) => {
	passport.authenticate("local", async (err, user, info) => {
		if (err) return next(new BadRequestResponse(err.message));
		if (!user) return next(new BadRequestResponse(`Either incorrect username/password or user does not exist.`, 423));
		let response = await fetch(`http://ip-api.com/json/${req.ip}?fields=country`);
		response = await response.json();
		user.loginHistory.push({
			date: Date.now().toString(),
			loginMethod: "EmailLogin",
			country: response.country || "PK",
			ipAddress: req.ip, //::1
		});
		req.session.username = user.username;
		user.save();
		heartsPokerSocket.emit("user-logged-in", user?.username + " just logged in");
		return next(new OkResponse({ user: user.toAuthJSON() }));
	})(req, res, next);
});

router.post("/signup", async (req, res, next) => {
	if (!req.body.email || !req.body.username || !req.body.password)
		return next(new BadRequestResponse("Incomplete credentials!"));
	let record = await User.find({ $or: [{ email: req.body.email }, { username: req.body.username }] });
	if (record.length > 0) {
		if (record.some((item) => item.username === req.body.username))
			return next(new BadRequestResponse("This username is already in taken"));
		if (record.some((item) => item.email === req.body.email))
			return next(new BadRequestResponse("This email is already in taken"));
	} else {
		let newUser = new User({
			username: req.body.username,
			email: req.body.email,
			signUpType: "oauth",
		});
		if (req.body.referralCode) {
			let foundUser = await User.findOne({ referralCode: req.body.referralCode });
			if (foundUser) {
				foundUser.referralUsedBy.push(newUser._id);
				newUser.referredBy = foundUser._id;
				foundUser.save();
			}
		}
		newUser.setPassword(req.body.password);
		newUser.generateMailToken();
		newUser
			.save()
			.then((response) => {
				sendEmail(response, "Email Verification", { verifyEmail: true });
				return next(new OkResponse("SignedUp successfully"));
			})
			.catch((err) => {
				return next(new BadRequestResponse("Something went wrong!"));
			});
	}
});
//Creating Accounts================
router.get("/auth/steam", (req, res, next) => {
	passport.authenticate("steam")(req, res, next);
});

router.get("/auth/twitch", (req, res, next) => {
	passport.authenticate("twitch")(req, res, next);
});

router.get("/auth/steam/return", passport.authenticate("steam", { session: false }), (req, res) => {
	const username = req?.session?.username;
	const profile = req?.user;
	User.findOne({ $or: [{ "steam.id": req?.user?.id }, { username: username }] }, async (err, user) => {
		if (err) return next(new BadRequestResponse(err));
		if (user) {
			let response = await fetch(`http://ip-api.com/json/${req.ip}?fields=country`);
			response = await response.json();
			//if there is a user  id already but no token (user was linked at one point and then removed)
			if (!user.steam.id) {
				user.steam.id = profile.id;
				user.steam.avatar = profile._json.avatar;
				user.steam.link = profile._json.profileurl;
				user.steam.username = profile.displayName;
				user.steam.location = {
					countryCode: profile._json.loccountrycode,
					stateCode: profile._json.locstatecode,
					postalCode: profile._json.loccityid,
				};
			}
			user.loginHistory.push({
				date: Date.now().toString(),
				loginMethod: "Steam",
				country: response.country || "PK",
				ipAddress: req.ip, //::1
			});
			user.save(function (err) {
				if (err) return next(new BadRequestResponse(err));
				let responseHTML = htmlPage.replace("%value%", JSON.stringify({ user: user.toAuthJSON() }));
				return res.status(200).send(responseHTML);
			});
		} else {
			// if there is no  user, create them
			console.log("user not found");

			const newUser = new User({
				username: profile.displayName,
				signUpType: "steam",
			});
			newUser.isEmailVerified = true;
			newUser.profileImage = profile._json.avatar;
			newUser.steam.id = profile.id;
			newUser.steam.avatar = profile._json.avatar;
			newUser.steam.link = profile._json.profileurl;
			newUser.steam.username = profile.displayName;
			(newUser.steam.location = {
				countryCode: profile._json.loccountrycode,
				stateCode: profile._json.locstatecode,
				postalCode: profile._json.loccityid,
			}),
				await newUser.save();
			let responseHTML = htmlPage.replace("%value%", JSON.stringify({ user: req.user.toAuthJSON() }));
			return res.status(200).send(responseHTML);
		}
	});
});

router.get("/auth/twitch/callback", passport.authenticate("twitch"), (req, res) => {
	let responseHTML = htmlPage.replace("%value%", JSON.stringify({ user: req.user.toAuthJSON() }));
	return res.status(200).send(responseHTML);
});
//==============================

//Linking Accounts
router.get("/connect/steam", auth.attachUser, (req, res, next) => {
	req.session.username = req.user.username;
	passport.authenticate("steam", { session: false })(req, res, next);
});

router.get("/connect/twitch", (req, res, next) => {
	req.session.username = req.user.username;
	passport.authenticate("twitch", { session: false })(req, res, next);
});

//==========================

router.post("/metamask-login", async (req, res, next) => {
	const walletAddress = req.body.walletAddress;
	const signature = req.body.signature;
	const nonce = req.body.nonce;
	if (!signature || !walletAddress) {
		return res.status(400).send({ error: "Request should have signature and publicAddress" });
	}

	const msg = `Welcome to Token Society! Click “Sign” to create an account. No password needed! You will only need to sign this message once for account creation. This request will not trigger a blockchain transaction or cost any gas fees. I am signing-up using my one-time nonce: ${nonce}`;

	// We now are in possession of msg, publicAddress and signature. We
	// will use a helper from eth-sig-util to extract the address from the signature
	const msgBufferHex = bufferToHex(Buffer.from(msg, "utf8"));
	const address = recoverPersonalSignature({
		data: msgBufferHex,
		sig: signature,
	});

	// The signature verification is successful if the address found with
	// sigUtil.recoverPersonalSignature matches the initial publicAddress
	if (address.toLowerCase() == walletAddress.toLowerCase()) {
		let foundUser = await User.count({ walletAddress: walletAddress });
		if (foundUser > 0) return next(new BadRequestResponse("Account already exists. Try to sign in again"));
		let user = new User();
		user.walletAddress = walletAddress;
		user.signUpType = "metamask";
		user.isEmailVerified = true;
		user.role = "user";
		if (req.body.referralCode) {
			let foundUser = await User.findOne({ referralCode: req.body.referralCode });
			if (foundUser) {
				foundUser.referralUsedBy.push(user._id);
				user.referredBy = foundUser._id;
				foundUser.save();
			}
		}
		user.save((err, result) => {
			if (err) next(new BadRequestResponse(err));
			next(new OkResponse({ result: result.toAuthJSON() }));
		});
	} else {
		res.status(401).send({
			error: "Signature verification failed",
		});
		return null;
	}
});

router.post("/forgot-password", async (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, user) => {
		if (err || !user) next(new BadRequestResponse("Email not found!"));
		if (user) {
			user.generatePasswordRestToken();
			user.salt = null;
			user.hash = null;
			user.otpExpires = Date.now() + 1000 * 60 * 30;
			user
				.save()
				.then((data) => {
					sendEmail(data, "Reset Password", { forgetPassword: true });
					next(new OkResponse("Mail sent successfully!"));
				})
				.catch((err) => {
					next(new BadRequestResponse(err));
				});
		}
	});
});

router.post("/reset-password", async (req, res, next) => {
	User.findById(req.body.id, (err, user) => {
		if (err || !user) return next(new BadRequestResponse("No Request Found!"));
		if (user && (user.otpExpires < Date.now() || user.resetPasswordToken !== req.body.token)) {
			return next(new BadRequestResponse("Token expired!"));
		} else {
			user.setPassword(req.body.password);
			user.resetPasswordToken = null;
			user.mailToken = null;
			user.otpExpires = null;
			user
				.save()
				.then((data) => {
					next(new OkResponse("Password reset successfully!"));
				})
				.catch((err) => {
					next(new BadRequestResponse(err));
				});
		}
	});
});

router.post("/verify-email", async (req, res, next) => {
	User.findById(req.body.id, (err, user) => {
		if (err || !user) next(new BadRequestResponse("Email not found!"));
		if (user && user.mailToken === req.body.token) {
			user.mailToken = null;
			user.isEmailVerified = true;
			user
				.save()
				.then((data) => {
					next(new OkResponse("Successfully Verified"));
				})
				.catch((err) => {
					next(new BadRequestResponse(err));
				});
		} else {
			return next(new BadRequestResponse("Invalid"));
		}
	});
});

router.get("/send-verification-email", auth.isToken, auth.user, (req, res, next) => {
	if (req.user.isEmailVerified) {
		return next(new OkResponse("Email is already verified!"));
	} else {
		req.user.generateMailToken();
		req.user
			.save()
			.then((response) => {
				sendEmail(response, "Email Verification", { verifyEmail: true });
				return next(new OkResponse("SignedUp successfully"));
			})
			.catch((err) => {
				return next(new BadRequestResponse("Error sending email"));
			});
	}
});

router.post("/change-password", auth.isToken, auth.user, async (req, res, next) => {
	let response = await req.user.validPassword(req.body.oldPassword);
	if (response) {
		req.user.setPassword(req.body.newPassword);
		req.user
			.save()
			.then((data) => {
				return next(new OkResponse(data));
			})
			.catch((err) => {
				next(new BadRequestResponse(err));
			});
	} else {
		return next(new BadRequestResponse("Incorrect Old Password"));
	}
});

router.post("/checkUserName", async (req, res, next) => {
	let count = await User.count({ username: req.body.username });
	if (count > 0) return next(new BadRequestResponse("Username already in use!"));
	return next(new OkResponse("OK"));
});

router.post("/changeUserName", auth.isToken, async (req, res, next) => {
	let count = await User.count({ username: req.body.username });
	if (count > 0) return next(new BadRequestResponse("Username already in use!"));
	req.user.username = req.body.username;
	req.user.save();
	return next(new OkResponse(req.user));
});

// =====================> Refferals
router.post("/set-referral-code", auth.isToken, auth.user, async (req, res, next) => {
	if (!req.body.referralCode) return next(new BadRequestResponse("Code not found!"));
	if (req.user.referredBy) return next(new BadRequestResponse("You can't change referral code once it is set!"));
	let foundUser = await User.findOne({ referralCode: req.body.referralCode });
	if (foundUser) {
		foundUser.referralUsedBy.push(req.user._id);
		req.user.referredBy = foundUser._id;
		foundUser.save();
		req.user.save();
		return next(new OkResponse(req.user));
	} else {
		return next(new BadRequestResponse("Invalid referral code!"));
	}
});

router.get("/data", auth.isToken, auth.user, async (req, res, next) => {
	User.findById(req.user.referredBy, (err, user) => {
		if (err || !user) return next(new BadRequestResponse("Something went wrong!"));
		return next(new OkResponse(user));
	});
});

router.get("/getRefferals", auth.isToken, auth.user, (req, res, next) => {
	User.find({
		_id: {
			$in: req.user?.referralUsedBy,
		},
	})
		.select("email balance signUpType username walletAddress createdAt")
		.exec((err, data) => {
			if (err || !data) return next(new BadRequestResponse("Not Found!"));
			return next(new OkResponse(data));
		});
});

module.exports = router;

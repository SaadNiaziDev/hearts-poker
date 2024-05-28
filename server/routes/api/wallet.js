let router = require("express").Router();
let fetch = require("node-fetch");
const { recoverPersonalSignature } = require("eth-sig-util");
const { bufferToHex } = require("ethereumjs-util");
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
let jwt = require("jsonwebtoken");

let User = mongoose.model("User");

let { secret, backend } = require("../../config/env/development");

router.get("/", (req, res, next) => {
	if (req.query.walletAddress || typeof req.query.walletAddress != "undefined") {
		User.findOne({ walletAddress: req.query.walletAddress }, (err, result) => {
			if (err) {
				console.log(err);
			} else if (!result) {
				next(new OkResponse({ result: result }));
			} else {
				next(new OkResponse({ result: result }));
			}
		});
	} else {
		next(new OkResponse({ result: null }));
	}
});

router.post("/auth", (req, res, next) => {
	const walletAddress = req.body.walletAddress;
	const signature = req.body.signature;
	if (!signature || !walletAddress) {
		return res.status(400).send({ error: "Request should have signature and publicAddress" });
	}

	User.findOne({ walletAddress: walletAddress })
		.then((user) => {
			if (!user) {
				res.status(401).send({
					error: `User with publicAddress ${walletAddress} is not found in database`,
				});
				return null;
			} else return user;
		})
		.then((user) => {
			if (!user) {
				// Should not happen, we should have already sent the response
				throw new Error('User is not defined in "Verify digital signature".');
			}
			const msg = `Welcome to Token Society! Click “Sign” to connect your account. No password needed! This request will not trigger a blockchain transaction or cost any gas fees. I am signing my one-time nonce: ${user.nonce}`;

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
				return user;
			} else {
				res.status(401).send({
					error: "Signature verification failed",
				});
				return null;
			}
		})
		.then(async (user) => {
			if (!user) {
				// Should not happen, we should have already sent the response
				throw new Error('User is not defined in "Generate a new nonce for the user".');
			}
			user.nonce = Math.floor(Math.random() * 10000);
			let response = await fetch(`http://ip-api.com/json/${req.ip}?fields=country`);
			response = await response.json();
			user.loginHistory.push({
				date: Date.now().toString(),
				loginMethod: "Metamask",
				country: response.country || "PK",
				ipAddress: req.ip, //::1
			});
			return user.save();
		})
		.then((user) => {
			try {
				return new Promise((resolve, reject) =>
					jwt.sign(
						{
							id: user._id,
							walletAddress,
						},
						secret, //Will put in .env
						{
							algorithm: "HS256",
						},
						(err, token) => {
							if (err) {
								return reject(err);
							}
							if (!token) {
								return new Error("Empty token");
							}
							return resolve({ token, user });
						}
					)
				);
			} catch (e) {
				console.log("e");
			}
		})
		.then((data) => {
			res.send({ token: data.token, user: data.user.toJSON(), message: "Success" });
		})
		.catch((err) => {
			console.log(err);
			return next(new BadRequestResponse("Some error in api wallet"));
		});
});

module.exports = router;

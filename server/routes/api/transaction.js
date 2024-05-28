let mongoose = require("mongoose");
let router = require("express").Router();
const User = require("../../models/User");
let Config = require("../../models/Configuration");
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
let auth = require("../auth");
const Transaction = require("../../models/Transaction");

router.get("/config", (req, res, next) => {
	Config.find({}, (err, data) => {
		if (err || !data) return next(new BadRequestResponse(err));
		if (data[0]) return next(new OkResponse(data[0]));
		return next(new BadRequestResponse("No config exists"));
	});
});

router.post("/update-config", auth.isToken, auth.admin, (req, res, next) => {
	Config.find({}, (err, data) => {
		if (err) return next(new BadRequestResponse(err));
		if (data.length > 0) {
			data[0].address = req.body.address;
			data[0].save((err, result) => {
				if (err) return next(new BadRequestResponse(err));
				heartsPokerSocket.emit("configUpdated", result.address);
				return next(new OkResponse(result));
			});
		} else {
			let config = new Config({
				address: req.body.address,
			});
			config.save((err, result) => {
				if (err) return next(new BadRequestResponse(err));
				heartsPokerSocket.emit("configUpdated", result.address);
				return next(new OkResponse(result));
			});
		}
	});
});

router.get("/getDeposits", auth.isToken, auth.admin, (req, res, next) => {
	Transaction.find({ status: { $ne: "created" }, requestType: "deposit" }, (err, result) => {
		if (err) return next(new BadRequestResponse(err));
		return next(new OkResponse(result));
	});
});

router.get("/getWithdrawals", auth.isToken, auth.admin, (req, res, next) => {
	Transaction.find({ requestType: "withdrawal" }, (err, result) => {
		if (err) return next(new BadRequestResponse(err));
		return next(new OkResponse(result));
	});
});

router.post("/deposit-request", auth.isToken, auth.user, async (req, res, next) => {
	const { address, price, crypto } = req.body;
	if (!address) return next(new BadRequestResponse("Parameters missing!"));
	else {
		Transaction.updateMany(
			{ status: "created", address: address.toLowerCase(), token: crypto },
			{
				$set: {
					status: "pending",
					requester: req.user.id,
					requestType: "deposit",
					priceAtRequest: price,
				},
			},
			(err, data) => {
				if (err) return next(new BadRequestResponse(err));
				if (data.matchedCount === 0)
					return next(
						new BadRequestResponse(
							"No matching records found. You need to send BNB/ETH to the given wallet address and then request a transaction by pasting the wallet address from which you sent BNB/ETH. If you have already done that, please try again later."
						)
					);
				if (data.matchedCount > 0) {
					heartsPokerSocket.emit(`deposit-request-maded`);
					return next(new OkResponse("Okay"));
				}
			}
		);
	}
});

router.post("/handle-request", auth.isToken, auth.admin, (req, res, next) => {
	const { id, status, price } = req.body;
	if (!id || !status || !price) return next(new BadRequestResponse("Incomplete credentials!"));
	Transaction.findById(id, (err, data) => {
		if (err || !data) return next(new BadRequestResponse("Couldn't find transaction"));
		if (data) {
			data.status = status;
			if (status === "approved") {
				User.findById(data.requester, async (err, user) => {
					if (err || !user) return next(new BadRequestResponse("User not found"));
					let bal = (data.amount / 10 ** 18) * req.body.price;
					user.balance += bal;
					await user.save();
				});
				data.heartTokenPaid = (data.amount / 10 ** 18) * req.body.price;
				data.priceAtApproval = price;
			}
			data.save((err, result) => {
				if (err) return next(new BadRequestResponse("Something went wrong!"));
				heartsPokerSocket.emit(`deposit-request-handled-for-${result.requester}`);
				heartsPokerSocket.emit(`deposit-request-handled-for-user`);
				return next(new OkResponse(result));
			});
		}
	});
});

router.post("/withdrawal-request", auth.isToken, auth.user, async (req, res, next) => {
	const { address, amount, token, price } = req.body;
	if ((!address, !amount, !token, !price)) return next(new BadRequestResponse("Parameters missing!"));
	else {
		if (req.user.balance > amount) {
			req.user.balance = req.user.balance - amount;
			let newTx = new Transaction();
			newTx.address = address.toLowerCase();
			newTx.status = "pending";
			newTx.requestType = "withdrawal";
			newTx.requester = req.user._id;
			newTx.heartTokenPaid = amount;
			newTx.amount = amount / price;
			newTx.priceAtRequest = price;
			newTx.token = token === "eth" ? "eth" : "bnb";
			newTx.save(async (err, tx) => {
				await req.user.save();
				if (err) return next(new BadRequestResponse("Something went wrong!"));
				heartsPokerSocket.emit(`withdrawal-request-maded`);
				return next(new OkResponse("Okay"));
			});
		} else {
			return next(new BadRequestResponse("Insufficient balance"));
		}
	}
});

router.post("/handle-withdrawal", auth.isToken, auth.admin, async (req, res, next) => {
	try {
		const { id, status, hash } = req.body;
		if (!id || !status) {
			throw new BadRequestResponse("Incomplete credentials!");
		}

		const transaction = await Transaction.findById(id);
		if (!transaction) {
			throw new BadRequestResponse("Couldn't find transaction");
		}

		if (hash) {
			transaction.txhash = hash;
		}
		transaction.status = status;
		const result = await transaction.save();

		if (status === "rejected") {
			const user = await User.findById(result.requester);
			if (!user) {
				throw new BadRequestResponse("No user found!");
			}
			user.balance += result.heartTokenPaid;
			await user.save();
		}

		heartsPokerSocket.emit(`withdrawal-request-handled-for-${result.requester}`);
		heartsPokerSocket.emit(`withdrawal-request-handled-for-user`);

		return next(new OkResponse(result));
	} catch (err) {
		return next(new BadRequestResponse(err));
	}
});

router.get("/getUserDeposits", auth.isToken, auth.user, (req, res, next) => {
	Transaction.find({ requester: req.user.id, requestType: "deposit", status: { $ne: "created" } }, (err, tx) => {
		if (err || !tx) return next(new BadRequestResponse("No Record Found"));
		return next(new OkResponse(tx));
	});
});

router.get("/getUserWithdrawals", auth.isToken, auth.user, (req, res, next) => {
	Transaction.find({ requester: req.user.id, requestType: "withdrawal" }, (err, tx) => {
		if (err || !tx) return next(new BadRequestResponse("No Record Found"));
		return next(new OkResponse(tx));
	});
});

router.post("/create-record", async (req, res, next) => {
	let config = await Config.findOne({});
	if (req.body.confirmed) {
		let chain = req.body?.chainId;
		if (req.body.txs && req.body?.txs[0]?.toAddress.toLowerCase() === config.address.toLowerCase()) {
			try {
				let tx = req.body?.txs[0];
				let count = await Transaction.count({ txhash: tx.hash });
				if (count > 0) return next(new BadRequestResponse("Transaction already in database"));
				let tranc = new Transaction();
				tranc.txhash = tx.hash;
				tranc.amount = Number(tx.value);
				tranc.address = tx.fromAddress;
				tranc.status = "created";
				tranc.token = chain === "0x61" ? "bnb" : "eth";
				tranc.save((err, data) => {
					if (err) next(new BadRequestResponse(err));
					next(new OkResponse("Record found"));
				});
			} catch (error) {
				next(new BadRequestResponse(error));
			}
		} else next(new OkResponse("Test webhook found"));
	} else {
		next(new OkResponse("Record found"));
	}
});

module.exports = router;

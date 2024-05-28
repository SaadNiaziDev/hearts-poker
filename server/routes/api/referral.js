let mongoose = require("mongoose");
let router = require("express").Router();
let { OkResponse, BadRequestResponse, UnauthorizedResponse } = require("express-http-response");
let auth = require("./../auth");
const Referral = require("../../models/Referral");
const User = require("../../models/User");

router.get("/", auth.isToken, auth.user, (req, res, next) => {
	Referral.find({ referrer: req.user.id }, (err, referral) => {
		if (err || !referral) return next(new BadRequestResponse(err));
		let result = {
			totalWager: 0,
			totalClaimed: 0,
			totalAvailable: 0,
			claims: [],
		};
		referral.map((item) => {
			result.totalWager += item.wager;
			if (item.isClaimed) {
				result.totalClaimed += item.amount;
			} else {
				result.totalAvailable += item.amount;
				result.claims.push(item);
			}
		});
		return next(new OkResponse(result));
	});
});

router.post("/claim", auth.isToken, auth.user, (req, res, next) => {
	if (!req.body.id) return next(new BadRequestResponse("Invalid Claim!"));
	try {
		Referral.findById(req.body.id, async (err, result) => {
			if (err || !result) throw next(new BadRequestResponse(err));
			let foundUser = await User.findById(result.referrer);
			if (foundUser) {
				foundUser.balance += result.amount;
			}
			await foundUser.save();
			result.isClaimed = true;
			await result.save();
			return next(new OkResponse("Status Updated"));
		});
	} catch (error) {
		next(error);
	}
});
module.exports = router;

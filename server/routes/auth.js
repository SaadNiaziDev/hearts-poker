let jsonwebtoken = require("jsonwebtoken");
let secret = require("../config").secret;
let mongoose = require("mongoose");

let User = mongoose.model("User");
const { InternalServerErrorResponse, UnauthorizedResponse, BadRequestResponse } = require("express-http-response");

const isToken = function (req, res, next) {
	if (req.headers.authorization) {
		let token = req.headers.authorization.split(" ");
		if (typeof token[1] === "undefined" || typeof token[1] === null) {
			next(new UnauthorizedResponse("Please login first to continue further!"));
		} else {
			jsonwebtoken.verify(token[1], secret, (err, data) => {
				if (err) {
					next(new UnauthorizedResponse("Please login first to continue further!"));
				} else {
					User.findById(data.id)
						.then(function (user) {
							if (!user) {
								next(new ForbiddenResponse());
							}
							req.user = user;
							next();
						})
						.catch((e) => {
							next(new BadRequestResponse(e.error));
						});
				}
			});
		}
	} else {
		next(new UnauthorizedResponse("No Token Attached to request!"));
	}
};

const user = async (req, res, next) => {
	if (req.user && req.user.role === "user") next();
	else next(new UnauthorizedResponse("You are not allowed to access this"));
};

const admin = (req, res, next) => {
	if (req.user && req.user.role === "admin") next();
	else next(new UnauthorizedResponse("You are not allowed to access this"));
};

const attachUser = (req, res, next) => {
	if (req.query.token) {
		jsonwebtoken.verify(req.query.token, secret, (err, data) => {
			if (err) {
				next();
			} else {
				User.findById(data.id)
					.then(function (user) {
						if (!user) {
							next(new ForbiddenResponse());
						}
						req.user = user;
						next();
					})
					.catch((e) => {
						next(new BadRequestResponse(e.error));
					});
			}
		});
	} else {
		next();
	}
};

module.exports = {
	isToken,
	user,
	admin,
	attachUser,
};

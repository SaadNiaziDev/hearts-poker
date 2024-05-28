let mongoose = require("mongoose");
let uniqueValidator = require("mongoose-unique-validator");
let crypto = require("crypto");
let jwt = require("jsonwebtoken");
const mongoosePaginate = require("mongoose-paginate-v2");
const uuidv4 = require("uuid");

const { publicPics, secret } = require("../config");

let UserSchema = new mongoose.Schema(
	{
		username: { type: String },
		email: { type: String },
		profileImage: {
			type: String,
			default: `${publicPics}/noImage.png`,
		},
		isProfileCompleted: { type: Boolean, default: false },
		otpExpires: { type: Date, default: null },
		signUpType: { type: String, default: "oauth" },
		isEmailVerified: { type: Boolean, default: false },
		status: { type: String, enum: ["verified", "rejected", "inactive", "pending"], default: "pending" },
		hash: { type: String, default: null },
		salt: { type: String },
		steam: {
			id: String,
			avatar: String,
			link: String,
			username: String,
			location: {
				countryCode: String,
				stateCode: String,
				postalCode: Number,
			},
		},
		twitch: {
			id: String,
			avatar: String,
			username: String,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		loginHistory: [
			{
				date: { type: String },
				loginMethod: { type: String },
				country: { type: String },
				ipAddress: { type: String },
			},
		],
		resetPasswordToken: { type: String, default: null },
		mailToken: { type: String, default: null },
		walletAddress: { type: String, required: true, unique: true },
		nonce: { type: Number, default: Math.floor(Math.random() * 10000) },
		balance: { type: Number, default: 0 },
		referralCode: { type: String },
		referralUsedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
		referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
	},
	{ timestamps: true }
);

UserSchema.methods.getCode = function () {
	let a = uuidv4.v4();
	this.referralCode = a;
};

UserSchema.pre("validate", function (next) {
	if (!this.referralCode) {
		this.getCode();
	}
	next();
});

UserSchema.plugin(uniqueValidator, { message: "Taken" });
UserSchema.plugin(mongoosePaginate);

UserSchema.methods.validPassword = function (password) {
	let hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
	return this.hash === hash;
};

UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString("hex");
	this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UserSchema.methods.generatePasswordRestToken = function () {
	this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
};

UserSchema.methods.generateMailToken = function () {
	this.mailToken = crypto.randomBytes(10).toString("hex");
};

UserSchema.methods.generateJWT = function () {
	let today = new Date();
	let exp = new Date(today);
	exp.setDate(today.getDate() + 1);

	return jwt.sign(
		{
			id: this._id,
			walletAddress: this.walletAddress,
			exp: parseInt(exp.getTime() / 1000),
		},
		secret,
		{
			algorithm: "HS256",
		}
	);
};

UserSchema.methods.toAuthJSON = function () {
	return {
		_id: this._id,
		username: this.username,
		email: this.email,
		role: this.role,
		profileImage: this.profileImage,
		walletAddress: this.walletAddress,
		token: this.generateJWT(),
		isProfileCompleted: this.isProfileCompleted,
		isEmailVerified: this.isEmailVerified,
		loginHistory: this.loginHistory,
		nonce: this.nonce,
		signUpType: this.signUpType,
		status: this.status,
		steam: this.steam,
		twitch: this.twitch,
		balance: this.balance,
		referralCode: this.referralCode,
		referralUsedBy: this.referralUsedBy,
		referredBy: this.referredBy,
		createdAt: this.createdAt,
	};
};

UserSchema.methods.toJSON = function () {
	return {
		_id: this._id,
		username: this.username,
		email: this.email,
		profileImage: this.profileImage,
		role: this.role,
		walletAddress: this.walletAddress,
		loginHistory: this.loginHistory,
		status: this.status,
		steam: this.steam,
		nonce: this.nonce,
		signUpType: this.signUpType,
		twitch: this.twitch,
		isEmailVerified: this.isEmailVerified,
		isProfileCompleted: this.isProfileCompleted,
		balance: this.balance,
		referralCode: this.referralCode,
		referralUsedBy: this.referralUsedBy,
		referredBy: this.referredBy,
		createdAt: this.createdAt,
	};
};

UserSchema.methods.toWebJSON = function () {
	return {
		walletAddress: this.walletAddress,
		nonce: this.nonce,
	};
};

module.exports = mongoose.model("User", UserSchema);

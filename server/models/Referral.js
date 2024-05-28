const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReferralSchema = new Schema(
	{
		referrer: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
		username: { type: String },
		wager: { type: Number },
		amount: { type: Number },
		isClaimed: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Referral", ReferralSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
	{
		requester: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
		address: { type: String },
		txhash: { type: String },
		amount: { type: Number },
		status: { type: String, enum: ["created", "pending", "approved", "rejected"] },
		token: { type: String, enum: ["bnb", "eth"] },
		requestType: { type: String, enum: ["deposit", "withdrawal"] },
		priceAtRequest: { type: Number },
		heartTokenPaid: { type: Number },
		priceAtApproval: { type: Number },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);

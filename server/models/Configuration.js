const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigurationSchema = new Schema(
	{
		address: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Config", ConfigurationSchema);

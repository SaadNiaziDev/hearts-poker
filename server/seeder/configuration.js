const Configuration = require("../models/Configuration");

async function seedConfig() {
	let new_Config = await Configuration.create({
		address: "0x2866FBE2CA9D506745aA7C2D5C7b0D88fEAab617",
	});
	console.log(new_Config);
}

module.exports = seedConfig;

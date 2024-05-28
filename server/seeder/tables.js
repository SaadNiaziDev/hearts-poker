const Game = require("../models/Game");
const User = require("../models/User");
const { faker } = require("@faker-js/faker");

async function createTables() {
	let owners = await User.find();
	// Seed Admin
	for (let i = 0; i < owners.length; i++) {
		{
			let table = new Game();
			table.name = faker.name.fullName();
			table.pot = faker.datatype.number({ min: 0, max: 10000000 });
			table.maxPlayers = faker.datatype.number({ min: 0, max: 10 });
			await table.save();
		}
	}
	console.log("Tables Seeded");
}

module.exports = createTables;

const User = require("../models/User");
const publicPics = require("../config").publicPics;

async function seedUser() {
	// Seed Admin
	{
		let admin = new User();
		admin.role = "admin";
		admin.email = "admin@hearts.com";
		admin.firstName = "admin";
		admin.setPassword("Asdf123");
		admin.isEmailVerified = true;
		admin.status = "verified";
		admin.profileImage = publicPics + "/user.png";
		admin.isProfileCompleted = true;
		admin.walletAddress = "0x2866FBE2CA9D506745aA7C2D5C7b0D88fEAab600";

		await admin.save();
	}
	console.log("Default Users Seeded");
}

module.exports = seedUser;

let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let SteamStrategy = require("passport-steam").Strategy;
var twitchStrategy = require("passport-twitch-strategy").Strategy;
let mongoose = require("mongoose");
let User = mongoose.model("User");
let { steamKey, twitchClientID, twitchClientSecretKey } = require("../config");
const frontend = require("../config").frontend;
const backend = require("../config").backend;

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

passport.use(
	new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
		User.findOne({ email: email }, (err, user) => {
			if (err) return done(err);
			if (!user) {
				return done(null, false, { message: "Incorrect Email Address" });
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: "Incorrect Password" });
			}
			return done(null, user);
		});
	})
);

passport.use(
	"twitch",
	new twitchStrategy(
		{
			clientID: twitchClientID,
			clientSecret: twitchClientSecretKey,
			callbackURL: backend + "/api/user/auth/twitch/callback",
			scope: "user:read:email",
			passReqToCallback: true,
		},
		function (req, accessToken, refreshToken, profile, done) {
			process.nextTick(function () {
				// check if the user is already  logged in
				if (!req.user) {
					User.findOne({ $or: [{ "twitch.id": profile.id }, { email: profile.email }] }, async (err, user) => {
						if (err) return done(err);
						if (user) {
							let response = await fetch(`http://ip-api.com/json/${req.ip}?fields=country`);
							response = await response.json();
							// if there is a user  id already but no token (user was linked at one point and then removed)
							if (!user.twitch.id) {
								user.twitch.id = profile.id;
								user.twitch.avatar = profile.profile_image_url;
								user.twitch.username = profile.displayName;
							}
							user.loginHistory.push({
								date: Date.now().toString(),
								loginMethod: "Twitch",
								country: response.country || "PK",
								ipAddress: req.ip, //::1
							});
							user.save(function (err) {
								if (err) throw err;
								return done(null, user);
							});
						} else {
							// if there is no  user, create them

							const newUser = new User({
								username: profile.displayName,
								email: profile.email,
								signUpType: "twitch",
							});
							newUser.profileImage = profile.profile_image_url;
							newUser.loginType = "twitch";
							newUser.isEmailVerified = true;
							newUser.twitch.id = profile.id;
							newUser.twitch.avatar = profile.profile_image_url;
							newUser.twitch.username = profile.displayName;
							await newUser.save();
							done(null, newUser);
						}
					});
				} else {
					// user already exists and is  logged in, we have to link accounts

					var user = req.user; // pull the user out  of the session

					user.twitch.id = profile.id;
					user.twitch.avatar = profile.profile_image_url;
					user.twitch.username = profile.displayName;
					user.save(function (err) {
						if (err) throw err;
						return done(null, user);
					});
				}
			});
		}
	)
);

passport.use(
	"steam",
	new SteamStrategy(
		{
			returnURL: backend + "/api/user/auth/steam/return",
			realm: backend + "/api/user/auth/steam/return",
			apiKey: steamKey,
		},
		function (identifier, profile, done) {
			process.nextTick(function () {
				return done(null, profile);
			});
		}
	)
);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./User");
const Referral = require("./Referral");
const Hand = require("pokersolver").Hand;

// Define the Game schema
const gameSchema = new Schema({
	name: { type: String, required: true },
	host: { type: String, required: true },
	players: [
		{
			pid: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
			address: { type: String, required: true },
			chips: { type: Number, default: 0 },
			cards: [
				{
					rank: { type: String, required: true },
					suit: { type: String, required: true },
				},
			],
			folded: { type: Boolean, default: false },
			isDisconnected: { type: Boolean, default: false },
			didLeft: { type: Boolean, default: false },
			bet: { type: Number, default: 0 },
			socket: { type: String, required: true },
		},
	],
	communityCards: [
		{
			rank: { type: String, required: true },
			suit: { type: String, required: true },
		},
	],
	winner: { type: {}, default: null },
	description: { type: String },
	fees: { type: Number, required: true, default: 100 },
	pot: { type: Number, default: 0 },
	currentBet: { type: Number, default: 0 },
	dealerIndex: { type: Number, default: -1 },
	activePlayerIndex: { type: Number, default: -1 },
	maxPlayers: { type: Number, default: 5 },
	currentRound: {
		type: String,
		enum: ["pre-flop", "flop", "turn", "river", "showdown"],
		default: "pre-flop",
	},
	deck: [],
	visibility: { type: String, default: "public" },
	movesMade: { type: Number, default: 0 },
	interval: { type: Number },
});

gameSchema.methods.generateDeck = function () {
	let deck = [
		{ suit: "h", rank: "2" },
		{ suit: "h", rank: "3" },
		{ suit: "h", rank: "4" },
		{ suit: "h", rank: "5" },
		{ suit: "h", rank: "6" },
		{ suit: "h", rank: "7" },
		{ suit: "h", rank: "8" },
		{ suit: "h", rank: "9" },
		{ suit: "h", rank: "10" },
		{ suit: "h", rank: "J" },
		{ suit: "h", rank: "Q" },
		{ suit: "h", rank: "K" },
		{ suit: "h", rank: "A" },
		{ suit: "d", rank: "2" },
		{ suit: "d", rank: "3" },
		{ suit: "d", rank: "4" },
		{ suit: "d", rank: "5" },
		{ suit: "d", rank: "6" },
		{ suit: "d", rank: "7" },
		{ suit: "d", rank: "8" },
		{ suit: "d", rank: "9" },
		{ suit: "d", rank: "10" },
		{ suit: "d", rank: "J" },
		{ suit: "d", rank: "Q" },
		{ suit: "d", rank: "K" },
		{ suit: "d", rank: "A" },
		{ suit: "c", rank: "2" },
		{ suit: "c", rank: "3" },
		{ suit: "c", rank: "4" },
		{ suit: "c", rank: "5" },
		{ suit: "c", rank: "6" },
		{ suit: "c", rank: "7" },
		{ suit: "c", rank: "8" },
		{ suit: "c", rank: "9" },
		{ suit: "c", rank: "10" },
		{ suit: "c", rank: "J" },
		{ suit: "c", rank: "Q" },
		{ suit: "c", rank: "K" },
		{ suit: "c", rank: "A" },
		{ suit: "s", rank: "2" },
		{ suit: "s", rank: "3" },
		{ suit: "s", rank: "4" },
		{ suit: "s", rank: "5" },
		{ suit: "s", rank: "6" },
		{ suit: "s", rank: "7" },
		{ suit: "s", rank: "8" },
		{ suit: "s", rank: "9" },
		{ suit: "s", rank: "10" },
		{ suit: "s", rank: "J" },
		{ suit: "s", rank: "Q" },
		{ suit: "s", rank: "K" },
		{ suit: "s", rank: "A" },
	];
	var m = deck.length,
		t,
		i;

	// While there remain elements to shuffle…
	while (m) {
		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = deck[m];
		deck[m] = deck[i];
		deck[i] = t;
	}

	return deck;
};

gameSchema.pre("validate", function (next) {
	if (this.deck.length <= 0) {
		this.deck = this.generateDeck();
	}
	next();
});

gameSchema.methods.nextTurn = function () {
	let timer = 30;
	clearInterval(this.interval);
	if (!this.winner) {
		this.interval = setInterval(() => {
			if (timer > 0) {
				heartsPokerSocket.emit(`timer-update-${this.id}`, timer);
				timer--;
			} else {
				clearInterval(this.interval);
				// Logic for handling timer ran out
				this.check();
				this.save();
				heartsPokerSocket.emit(`table-${this.id}-data-changed`, this);
			}
		}, 1000);
	}
	return;
};

gameSchema.methods.nextRound = function () {
	const activePlayers = this.players.filter((player) => !player.folded);

	this.movesMade += 1;

	const movesMade = this.movesMade;
	const playerCount = activePlayers.length;
	const current_Round = Math.floor(movesMade / playerCount);

	let round = this.currentRound;

	if (round !== "turn" && current_Round === 1) {
		round = "turn";
		this.dealOneCard();
	} else if (round !== "river" && current_Round === 2) {
		round = "river";
		this.dealOneCard();
	} else if (round !== "showdown" && current_Round > 2) {
		round = "showdown";
		this.determineWinners();
	}
	this.currentRound = round;

	return;
};

gameSchema.methods.addPlayer = function (id, address, chips, socket) {
	if (isPlayerInList(this.players, id)) {
		return true;
	} else {
		this.players.push({
			pid: id,
			address: address,
			chips: chips,
			socket: socket ? socket : null,
		});
		return;
	}
};

gameSchema.methods.startRound = function () {
	const remainingDeck = this.deck;
	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < this.players.length; j++) {
			this.players[j].cards.push(remainingDeck.pop());
		}
	}
	this.dealerIndex = getNextPlayerIndex(this.players, this.dealerIndex);
	this.activePlayerIndex = getNextPlayerIndex(this.players, this.dealerIndex);

	this.currentBet = 0;
	this.pot = 0;

	this.currentRound = "flop";
	this.communityCards = [remainingDeck.pop(), remainingDeck.pop(), remainingDeck.pop()];

	this.activePlayerIndex = getNextPlayerIndex(this.players, this.dealerIndex);
};

gameSchema.methods.dealOneCard = function () {
	const remainingDeck = this.deck;
	this.communityCards.push(remainingDeck.pop());
};

function isValidBet(player, betAmount, currentBet) {
	return player.chips >= betAmount && betAmount >= currentBet;
}

function getNextPlayerIndex(players, currentPlayerIndex) {
	return (currentPlayerIndex + 1) % players.length;
}

function isPlayerInList(arr, id) {
	return arr.some((el) => el.pid.toString() === id.toString());
}

gameSchema.methods.call = function () {
	if (this.activePlayerIndex !== -1) {
		const player = this.players[this.activePlayerIndex];
		const callAmount = this.currentBet - player.bet;

		if (player?.chips >= callAmount) {
			player.chips -= callAmount;
			player.bet += callAmount;
			this.pot += callAmount;

			this.currentBet = player.bet;
			this.activePlayerIndex = getNextPlayerIndex(this.players, this.activePlayerIndex);
			this.nextTurn();
			this.nextRound();
			return;
		} else {
			this.allIn();
		}
	} else {
		return;
	}
};

gameSchema.methods.raiseBet = function (betAmount) {
	if (this.activePlayerIndex !== -1) {
		const player = this.players[this.activePlayerIndex];

		if (isValidBet(player, betAmount, this.currentBet)) {
			player.chips -= betAmount;
			player.bet += betAmount;
			this.pot += betAmount;
			this.currentBet = player.bet;

			this.activePlayerIndex = getNextPlayerIndex(this.players, this.activePlayerIndex);
			this.nextTurn();
			this.nextRound();

			return;
		} else {
			this.allIn();
		}
	} else {
		return;
	}
};

gameSchema.methods.check = function () {
	if (this.activePlayerIndex !== -1) {
		const player = this.players[this.activePlayerIndex];
		const callAmount = this.currentBet - player.bet;

		if (callAmount === 0) {
			this.activePlayerIndex = getNextPlayerIndex(this.players, this.activePlayerIndex);
			this.nextTurn();
			this.nextRound();
			return;
		} else {
			this.allIn();
		}
	} else {
		return;
	}
};

gameSchema.methods.allIn = function () {
	const player = this.players[this.activePlayerIndex];

	this.pot += player.chips;
	player.bet += player.chips;
	this.currentBet = player.bet;
	player.chips = 0;

	this.activePlayerIndex = getNextPlayerIndex(this.players, this.activePlayerIndex);
	this.nextTurn();
	this.nextRound();

	return;
};

gameSchema.methods.determineWinners = function () {
	const activePlayers = this.players.filter((player) => !player.folded || !player.didLeft);
	const threeCards = this.communityCards.map((card) => `${card.rank}${card.suit}`);
	const hands = activePlayers.map((player, i) => {
		let h = Hand.solve(player.cards.map((card) => `${card.rank}${card.suit}`).concat(threeCards), "standard");
		h.index = i;
		return h;
	});
	const winners = Hand.winners(hands);
	this.winner = activePlayers[winners[0].index];
	this.description = winners[0].descr;
	let arr = [];
	activePlayers.filter((item) => {
		arr.push(item.pid);
	});
	User.find(
		{
			_id: {
				$in: arr,
			},
		},
		(err, user) => {
			if (err) return null;
			user.map(async (user, i) => {
				user.balance += activePlayers[i]?.chips;
				if (user._id.toString() === this.winner.pid.toString()) {
					user.balance += this.pot;
					if (user.referredBy) {
						await Referral.create({
							referrer: user.referredBy,
							username: this.winner.address,
							wager: this.winner.bet,
							amount: this.winner.bet * 0.1,
							isClaimed: false,
						});
					}
				}
				await user.save();
			});
		}
	);
	heartsPokerSocket.emit(`table-${this._id.toString()}-ended`);
	this.activePlayerIndex = -1;
	return;
};

module.exports = mongoose.model("Game", gameSchema);

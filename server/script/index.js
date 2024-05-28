const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const { moralis_api, backend } = require("../config/env/development");
const Configuration = require("../models/Configuration");

Moralis.start({
	apiKey: moralis_api,
});
const streamStatus = async () => {
	const stream = {
		chains: [EvmChain.BSC_TESTNET, EvmChain.GOERLI], // list of blockchains to monitor
		description: "monitor Saad's wallet", // your description
		tag: "saad", // give it a tag
		// webhookUrl: "https://d686-39-55-200-69.ngrok-free.app/api/transaction/create-record", // webhook url to receive events,
		webhookUrl: `${backend}/api/transaction/create-record`, // webhook url to receive events,
		includeNativeTxs: true,
	};

	const newStream = await Moralis.Streams.add(stream);
	const { id } = newStream.toJSON();
	// Now we attach bobs address to the stream
	const config = await Configuration.findOne({});
	const address = config.address;

	await Moralis.Streams.addAddress({ address, id });
	heartsPokerSocket.on("configUpdated", async (data) => {
		await Moralis.Streams.addAddress({ address: data.address, id });
	});
};

streamStatus();

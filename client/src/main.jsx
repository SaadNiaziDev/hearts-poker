import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig } from 'wagmi'
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { config } from "./wagmi";
import { SocketContext, socket } from "./socket";

ReactDOM.createRoot( document.getElementById( "root" ) ).render(
	<BrowserRouter>
		<WagmiConfig config={config}>
			<SocketContext.Provider value={socket}>
				<App />
			</SocketContext.Provider>
		</WagmiConfig>
	</BrowserRouter>
);

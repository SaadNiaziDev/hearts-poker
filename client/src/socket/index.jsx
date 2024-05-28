import React from "react";
import { io } from "socket.io-client";
import { baseURL } from "../constants";

export const socket = io( baseURL, { transports: [ 'websocket' ] } );
export const SocketContext = React.createContext();
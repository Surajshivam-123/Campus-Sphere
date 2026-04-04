import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "";

// Single shared socket instance (lazy connect)
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

export default socket;

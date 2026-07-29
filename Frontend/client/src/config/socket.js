import { io } from "socket.io-client";

// In dev, connect directly to the backend to avoid Vite proxy WebSocket issues.
// In production, VITE_API_URL is set to the backend origin.
const SOCKET_URL = import.meta.env.VITE_API_URL;

// Single shared socket instance (lazy connect)
const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],   // skip long-polling, use WS directly
});

export default socket;

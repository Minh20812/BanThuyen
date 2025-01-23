import io from "socket.io-client";

// const SOCKET_URL = import.meta.env.PROD
//   ? "https://chatapp-mern-vhhz.onrender.com"
//   : "http://localhost:5000";

const SOCKET_URL = "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,

  transports: ["websocket", "polling"],
  path: "/socket.io/",

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;

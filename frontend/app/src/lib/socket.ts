import { io, Socket } from 'socket.io-client';
import { API_URL } from '../../config';

// Note: Unless you specifically created a '/socket' namespace in your backend server.js, 
// Socket.io usually just connects to the base API_URL. 
const SOCKET_URL = API_URL; 

// One shared connection for the whole app. Import this instance anywhere
// you need to listen for or react to real-time events.
export const socket: Socket = io(SOCKET_URL, { 
  autoConnect: true,
  // Safely handle cPanel WebSocket restrictions in production
  transports: window.location.hostname === 'localhost' 
    ? ['polling', 'websocket'] 
    : ['polling']
});
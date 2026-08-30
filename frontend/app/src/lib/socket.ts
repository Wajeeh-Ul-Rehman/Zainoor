import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

// One shared connection for the whole app. Import this instance anywhere
// you need to listen for or react to real-time events.
export const socket: Socket = io(SOCKET_URL, { autoConnect: true });
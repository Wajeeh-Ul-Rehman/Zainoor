const { Server } = require('socket.io');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io was not initialized — call initSocket(server) first.');
  return io;
}

module.exports = { initSocket, getIO };
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes');
const connectDB = require('./db/config');
const cors = require('cors');
// Initialize the app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

require('dotenv').config()
app.use(express.json());
app.use(cors())

connectDB()

// Sample in-memory chat data
let messages = [];

// Define a simple route

app.use('/api', routes);
app.get('/', (req, res) => {
  res.send('Chat App Backend');
});


// Socket.IO for real-time messaging
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join room
  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Leave room
  socket.on('leaveRoom', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`User left room: ${roomId}`);
  });

  // Broadcast messages within a room
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    io.to(message.roomId).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});


// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

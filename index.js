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
  
  // Listen for incoming messages
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    messages.push(message);
    // Emit to all clients (broadcast)
    io.emit('receiveMessage', message);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

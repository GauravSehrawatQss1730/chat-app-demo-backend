const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes');
const connectDB = require('./db/config');
const cors = require('cors');
const Message = require('./models/Message');
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

  socket.on('joinRoom', ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on('sendMessage', async (message) => {
    console.log("Got a new message")
    const { chat, sender, text } = message;

    // Save the message to the database
    const newMessage = await Message.create({ chat, sender, text });

    // Emit the message to all clients in the room
    io.to(chat).emit('receiveMessage', newMessage);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});



// Set up the server to listen on a port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// routes/index.js
const express = require('express');
const userRoutes = require('./user');  // Import user routes
const chatRoutes = require('./chat');  // Import chat routes (assuming you have this route)
const { createMessage, getMessagesByChat } = require('./message');

const router = express.Router();

// Register the routes
router.use('/users', userRoutes);  // All user-related routes
router.use('/chats', chatRoutes);  // All chat-related routes


// Create a new message
router.post('/messages', createMessage);

// Get all messages for a specific chat
router.get('/messages/:chatId', getMessagesByChat);

module.exports = router;

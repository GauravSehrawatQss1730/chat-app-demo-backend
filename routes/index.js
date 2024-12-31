// routes/index.js
const express = require('express');
const userRoutes = require('./user');  // Import user routes
const chatRoutes = require('./chat');  // Import chat routes (assuming you have this route)

const router = express.Router();

// Register the routes
router.use('/users', userRoutes);  // All user-related routes
router.use('/chats', chatRoutes);  // All chat-related routes

module.exports = router;
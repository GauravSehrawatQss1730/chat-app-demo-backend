const mongoose = require('mongoose');
const { Schema } = mongoose;
const Chat = require('./Chat'); // Import the base Chat model

// Create DirectChat schema
const directChatSchema = new Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // User model reference
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Create the DirectChat model as a discriminator of Chat
const DirectChat = Chat.discriminator('direct', directChatSchema);

module.exports = DirectChat;

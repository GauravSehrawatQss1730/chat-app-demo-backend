const mongoose = require('mongoose');
const { Schema } = mongoose;
const  GroupAccess  = require('../group-access'); // Assuming you have an enum for group access levels
const Chat = require('./Chat'); // Import the base Chat model

// Create GroupChat schema
const groupChatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    avatar: String,
    tags: [String],
    color: String,
    members: [
      {
        access: {
          type: String,
          enum: Object.values(GroupAccess), // Assuming GroupAccess enum contains values like 'owner', 'user', etc.
          default: GroupAccess.USER,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',  // User model reference
          required: true,
        },
      },
    ],
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// Create the GroupChat model as a discriminator of Chat
const GroupChat = Chat.discriminator('group', groupChatSchema);

module.exports = GroupChat;

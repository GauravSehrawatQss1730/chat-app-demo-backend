const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['direct', 'group'],  // Ensures the type is either 'direct' or 'group'
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    discriminatorKey: 'type', // This allows discriminators to be used
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;

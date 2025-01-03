// controllers/messageController.js
const Message = require('../models/Message');
const Chat = require('../models/Chat');

exports.createMessage = async (req, res) => {
    
  try {
    const { chatId, senderId, text } = req.body;
    console.log(chatId, senderId, text);
    // Validate input
    if (!chatId || !senderId || !text) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create and save the message
    const newMessage = await Message.create({
      chat: chatId,
      sender: senderId,
      text,
    });

    // Optional: Update the chat's updatedAt
    await Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// controllers/messageController.js
exports.getMessagesByChat = async (req, res) => {
    try {
      const { chatId } = req.params;
  
      const messages = await Message.find({ chat: chatId })
        .populate('sender', 'name email') // Fetch sender details
        .sort({ timestamp: 1 }); // Sort by timestamp (oldest to newest)
  
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  };
  
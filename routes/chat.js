const express = require('express');
const DirectChat = require('../models/DirectChat'); // Import DirectChat and GroupChat discriminators
const {GroupChat } = require('../models/GroupChat'); 
const User = require('../models/User');
const authMiddleware = require('../middleware');
const router = express.Router();

// Create a new chat (direct or group)
router.post('/create', authMiddleware, async (req, res) => {
  const { type, user1, user2, members, chatName, department, description, meetName, color, tags } = req.body;

  try {
    if (type === 'direct') {
      // Ensure user1 and user2 are valid users
      const usersExist = await User.find({ '_id': { $in: [user1, user2] } });
      if (usersExist.length !== 2) {
        return res.status(400).json({ message: 'One or both users do not exist' });
      }

      // Create the DirectChat
      console.log(DirectChat)
      const directChat = await DirectChat({
        type,
        user1,
        user2,
        createTime: new Date(),
        archiveTime: null,  // Can be updated later
        meetName: null, // Optional field for direct chat
      });

      await directChat.save();
      return res.status(201).json(directChat);
    }

    if (type === 'group') {
      // Ensure members exist in the system
      const usersExist = await User.find({ '_id': { $in: members.map(m => m.user) } });
      if (usersExist.length !== members.length) {
        return res.status(400).json({ message: 'One or more members do not exist' });
      }

      // Create the GroupChat
      const groupChat = new GroupChat({
        type,
        name: chatName, 
        department,
        description,
        meetName,
        color,
        tags,
        members,
        createTime: new Date(),
        archiveTime: null,  // Can be updated later
      });

      await groupChat.save();
      return res.status(201).json(groupChat);
    }

    return res.status(400).json({ message: 'Invalid chat type' });
  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).json({ message: 'Error creating chat' });
  }
});

module.exports = router;

const express = require('express');
const DirectChat = require('../models/DirectChat'); // Import DirectChat and GroupChat discriminators
const {GroupChat } = require('../models/GroupChat'); 
const User = require('../models/User');
const authMiddleware = require('../middleware');
const router = express.Router();

// Create a new chat (direct or group)
router.post('/create', authMiddleware, async (req, res) => {
  const user1 = req.user.id;
  const { type, user2, members, chatName, department, description, meetName, color, tags } = req.body;

  try {
    // if (type === 'direct') {
    //   // Ensure user1 and user2 are valid users
    //   const usersExist = await User.find({ '_id': { $in: [user1, user2] } });
    //   if (usersExist.length !== 2) {
    //     return res.status(400).json({ message: 'One or both users do not exist' });
    //   }

    //   // Create the DirectChat
    //   console.log(DirectChat)
    //   const directChat = await DirectChat({
    //     type,
    //     user1,
    //     user2,
    //     createTime: new Date(),
    //     archiveTime: null,  // Can be updated later
    //     meetName: null, // Optional field for direct chat
    //   });

    //   await directChat.save();
    //   return res.status(201).json(directChat);
    // }

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

router.get('/allChat', authMiddleware, async (req, res) => {
  try {
    // Extract the user ID from the token (assuming `req.user.id` contains the user ID after passing authMiddleware)
    const userId = req.user.id;

    // Fetch direct chats where the user is either user1 or user2
    const directChats = await DirectChat.find({
      $or: [{ user1: userId }, { user2: userId }]
    });

    // Fetch group chats where the user is a member
    const groupChats = await GroupChat.find({
      'members.user': userId
    });

    // Combine both into a single array
    const allChats = [...directChats, ...groupChats];

    return res.status(200).json(allChats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return res.status(500).json({ message: 'Error fetching user chats' });
  }
});

router.get('/chat-exists/:user2', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Extract userId from the token via authMiddleware
  const {user2} = req.params
  try {
    // Check if there are any direct chats where the user is either user1 or user2
    const directChatExists = await DirectChat.exists({
      $or: [
        { user1: userId, user2: user2 }, // Normal direct chat
        { user1: user2, user2: userId }, 
      ],
    });
    if(!directChatExists){
      const directChat = await DirectChat({
        type:'direct',
        user1:userId,
        user2,
        createTime: new Date(),
      });
      
      await directChat.save();      
      return res.status(200).json({ directChatExists: directChat });
    }
    return res.status(200).json({ directChatExists });
  } catch (error) {
    console.error('Error checking chat existence:', error);
    return res.status(500).json({ message: 'Error checking chat existence' });
  }
});

module.exports = router;

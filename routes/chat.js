const express = require('express');
const DirectChat = require('../models/DirectChat'); // Import DirectChat and GroupChat discriminators
const GroupChat = require('../models/GroupChat');
const User = require('../models/User');
const authMiddleware = require('../middleware');
const mongoose = require('mongoose');
const GroupAccess = require('../group-access');
const { sendResponse } = require('../utils/responseHandler');
const router = express.Router();

// Create a new chat (direct or group)
router.post('/create', authMiddleware, async (req, res) => {
  const user1 = req.user.id;
  const { type, user2, members, name: chatName, department, description, meetName, color, tags } = req.body;

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
      const userIds = members.map((m) => new mongoose.Types.ObjectId(m));
      const usersExist = await User.find({ _id: { $in: userIds } });

      if (usersExist.length !== members.length) {
        return res
          .status(400)
          .json({ message: 'One or more members do not exist' });
      }

      let formattedMembers = members.map((m) => ({user: new mongoose.Types.ObjectId(m), access: GroupAccess.USER}))

      
      formattedMembers.push({user: new mongoose.Types.ObjectId(req.user.id), access: GroupAccess.OWNER})

      // Create the GroupChat
      const groupChat = new GroupChat({
        type,
        name: chatName, 
        department,
        description,
        meetName,
        color,
        tags,
        members: formattedMembers,
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
    const userId = req.user.id;
    const { type: chatType } = req.query

    if(chatType === 'direct') {
      const directChats = await DirectChat.find({
        $or: [{ user1: userId }, { user2: userId }]
      }).populate([
        { path: 'user1', select: 'username email _id' },
        { path: 'user2', select: 'username email _id' },
      ]);

      if(!directChats) {
        return sendResponse(res, {status: 200, message: "Not Found", success: false, data: []})
      }
      
      const filteredChats = directChats?.map((chat) => {
        if (chat.user1 && chat.user2) {
          const oppositeUser =
            chat.user1._id.toString() === userId ? chat.user2 : chat.user1;
          return {
            _id: chat._id,
            userId: oppositeUser._id,
            name: oppositeUser.username,
            email: oppositeUser.email,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
          };
        }
        return null;
      }).filter(chat => chat !== null); 

      return sendResponse(res, {status: 200, message: "Found", success: true, data: filteredChats})
    }

    if(chatType === 'group') {
      const groupChats = await GroupChat.find({
        'members.user': userId
      });
      if(!groupChats) {
        return sendResponse(res, {status: 200, message: "Not Found", success: false, data: []})
      }
      return sendResponse(res, {status: 200, message: "Found", success: true, data: groupChats})
    }
    
    return sendResponse(res, {status: 400, message: "Invalid type.", success: false, data: null})
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return sendResponse(res, {status: 500, message: "Error fetching user chats.", success: false, data: null})
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const chatId = req.params.id;
    const chatType = req.query?.type;

    if (chatType === 'direct') {
      const directChat = await DirectChat.findById(chatId).populate([
        { path: 'user1', select: '-password' },
        { path: 'user2', select: '-password' },
      ]);

      return res.status(200).json(directChat);
    }

    if (chatType === 'group') {
      const groupChat = await GroupChat.findById(chatId).populate({
        path: 'members.user',
        select: 'username email _id',
      });

      return res.status(200).json(groupChat);
    }

    return res.status(404).json({ message: 'Chat not found' });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return res.status(500).json({ message: 'Error fetching chat' });
  }
});

router.get('/direct-chat-exists/:user2', authMiddleware, async (req, res) => {
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
      return res.status(200).json({ chat: directChat });
    }
    return res.status(200).json({ chat: directChatExists });
  } catch (error) {
    console.error('Error checking chat existence:', error);
    return res.status(500).json({ message: 'Error checking chat existence' });
  }
});

router.get('/group-chat-exists/:chatId', authMiddleware, async (req, res) => {
  const userId = req.user.id; // Extract userId from the token via authMiddleware
  const {chatId} = req.params
  try {
    // Check if there are any direct chats where the user is either user1 or user2
    const groupChat = await GroupChat.findOne({
      _id: chatId,
      'members.user': userId, // Check if userId exists in members array
    });
    
    if(!groupChat){
      return sendResponse(res, { status: 404, success: false, message: "You are not a part of this group", data: null })
    }
    return sendResponse(res, { status: 200, success: true, message: "Group found.", data: groupChat })
  } catch (error) {
    console.error('Error checking chat existence:', error);
    return sendResponse(res, { status: 500, success: false, message: "Internal Server Error.", data: null })
  }
});

module.exports = router;
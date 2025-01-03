// routes/user.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware');  // Import the auth middleware
const DirectChat = require('../models/DirectChat');
const GroupChat = require('../models/GroupChat');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, email: user.email },
    'your_secret_key',  // Replace with a secure secret key
    { expiresIn: '1h' }  // Token expires in 1 hour
  );
};

// 1. User registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create a new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser);

    return res.status(201).json({ message: 'User created successfully', token ,user :{
        name : newUser.username, email : newUser.email,
    } });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Error registering user' });
  }
});

// 2. User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.status(200).json({ message: 'Login successful', token,user :{
        name : user.username, email : user.email, 
    } });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Error logging in user' });
  }
});

// 3. Get user profile (with JWT authentication)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Access user information from req.user (set by authMiddleware)
    const user = await User.findById(req.user.id).select('-password');  // Don't return password in the response

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ message: 'Error retrieving user profile' });
  }
});

// 4. Update user profile (with JWT authentication)
router.put('/profile', authMiddleware, async (req, res) => {
  const { username, email } = req.body;

  try {
    // Update user profile based on req.user.id (set by authMiddleware)
    const user = await User.findByIdAndUpdate(req.user.id, { username, email }, { new: true });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Error updating user profile' });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find();

    // Respond with the list of users
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
});


module.exports = router;

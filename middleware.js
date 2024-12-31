// middleware/auth.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];  // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token and attach the decoded user data to the request object
    const decoded = jwt.verify(token, 'your_secret_key');  // Replace 'your_secret_key' with your secret key
    req.user = decoded;  // Attach user info to req.user
    next();  // Continue to the next middleware/route handler
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

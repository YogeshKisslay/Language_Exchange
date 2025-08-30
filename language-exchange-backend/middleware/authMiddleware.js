
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const authenticateUser = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token from Authorization header:', token); // Debug
  } 
  // Fallback to cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
    console.log('Token from cookie:', token); // Debug
  }

  if (!token) {
    console.log('No token provided in cookies or headers:', req.cookies, req.headers.authorization);
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    console.log('Authenticated user:', user._id);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = { authenticateUser };
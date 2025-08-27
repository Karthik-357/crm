const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Auth middleware - token:', token ? 'exists' : 'missing');
  console.log('Auth middleware - headers:', req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded token:', decoded);
    
    // Fetch the full user object from the database
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('Auth middleware - user not found for ID:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log('Auth middleware - user found:', user._id, user.email);
    
    // Set the full user object and additional properties for backward compatibility
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    console.error('Auth middleware - error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 
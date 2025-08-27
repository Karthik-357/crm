const User = require('../models/User');

exports.isAdmin = async (req, res, next) => {
  try {
    // Use req.user if available, otherwise fall back to req.userId for backward compatibility
    const userId = req.user?._id || req.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}; 
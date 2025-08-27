const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ name, email, password, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    if (currentUserId === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const updateData = { name, email };
    if (role) updateData.role = role;
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getUserSettings = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    if (currentUserId !== req.params.id) {
      const user = await User.findById(currentUserId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserSettings = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.userId;
    if (currentUserId !== req.params.id) {
      const user = await User.findById(currentUserId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { settings: req.body },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
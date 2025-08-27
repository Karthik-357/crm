const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    console.log('Creating task with user:', req.user);
    console.log('User ID:', req.user?.id || req.user?._id);
    
    // Set the userId from the authenticated user
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const taskData = { ...req.body, userId };
    console.log('Task data:', taskData);
    
    const task = new Task(taskData);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    console.log('Getting tasks for user:', req.user);
    console.log('User ID:', req.user?.id || req.user?._id);
    
    // If user is authenticated, return only their tasks
    if (req.user) {
      const userId = req.user?.id || req.user?._id;
      const tasks = await Task.find({ userId });
      console.log(`Found ${tasks.length} tasks for user ${userId}`);
      res.json(tasks);
    } else {
      // For unauthenticated requests, return empty array
      console.log('No user found, returning empty tasks array');
      res.json([]);
    }
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if the user owns this task
    if (req.user && task.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if the user owns this task
    if (req.user && task.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Check if the user owns this task
    if (req.user && task.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tasks for a specific user (admin function)
exports.getTasksByUserId = async (req, res) => {
  try {
    // Only admins can access other users' tasks
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 
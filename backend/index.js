const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Activity = require('./models/Activity');
const Event = require('./models/Event');
require('dotenv').config();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register route
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ name, email, password, role: role || 'user' });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info along with token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role; // Attach role if present
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin check middleware
const isAdmin = async (req, res, next) => {
  try {
    // Fetch user from DB to check role
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Protected route example
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// CUSTOMER ROUTES
app.post('/api/customers', verifyToken, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', verifyToken, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer stats for dashboard (new and previous month counts)
app.get('/api/customers/stats', async (req, res) => {
  try {
    const now = new Date();
    // Always use UTC for month boundaries
    const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const endOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));

    // Customers added this month
    const thisMonthCount = await Customer.countDocuments({
      createdAt: { $gte: startOfThisMonth }
    });
    // Customers added last month
    const lastMonthCount = await Customer.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }
    });

    // Remove debug logging

    res.json({
      thisMonth: thisMonthCount,
      lastMonth: lastMonthCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROJECT ROUTES
app.post('/api/projects', verifyToken, async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project and Revenue stats for dashboard
app.get('/api/projects/stats', async (req, res) => {
  try {
    // Count all in-progress projects
    const activeProjectsThisMonth = await Project.countDocuments({ status: 'in-progress' });
    // Sum value for all projects
    const allProjects = await Project.find();
    const revenueThisMonth = allProjects.reduce((acc, p) => acc + (p.value || 0), 0);

    res.json({
      activeProjects: {
        thisMonth: activeProjectsThisMonth,
        lastMonth: 0 // Not used anymore
      },
      revenue: {
        thisMonth: revenueThisMonth,
        lastMonth: 0 // Not used anymore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TASK ROUTES
app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ACTIVITY ROUTES
app.post('/api/activities', verifyToken, async (req, res) => {
  try {
    const activity = new Activity(req.body);
    await activity.save();
    res.status(201).json(activity);
    io.emit('new-activity', activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find();
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/activities/:id', verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json(activity);
    io.emit('activity-updated', activity); // Emit update event
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/activities/:id', verifyToken, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) return res.status(404).json({ error: 'Activity not found' });
    res.json({ message: 'Activity deleted' });
    io.emit('activity-deleted', { id: req.params.id }); // Emit delete event
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EVENT ROUTES
app.post('/api/events', verifyToken, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/events/:id', verifyToken, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USER MANAGEMENT ROUTES (Admin only)
app.get('/api/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', verifyToken, isAdmin, async (req, res) => {
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
});

app.delete('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.userId === req.params.id) {
      return res.status(400).json({ error: 'You cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const updateData = { name, email };
    if (role) {
      updateData.role = role;
    }
    if (password && password.trim()) {
      // Hash the new password
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET user settings
app.get('/api/users/:id/settings', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      // Only allow admin or the user themselves
      const user = await User.findById(req.userId);
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
});

// UPDATE user settings
app.put('/api/users/:id/settings', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      // Only allow admin or the user themselves
      const user = await User.findById(req.userId);
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
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
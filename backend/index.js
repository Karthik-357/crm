const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Modular routes
const customerRoutes = require('./routes/customers');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const activityRoutes = require('./routes/activities');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');

// Attach socket.io to activity controller
const activityController = require('./controllers/activityController');
activityController.setSocketIO(io);

// API routes
app.use('/api/customers', customerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Auth routes (register/login)
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authController = require('./controllers/authController');

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
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
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
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
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Password reset routes

app.post('/api/auth/send-otp', authController.sendOTP);
app.post('/api/auth/verify-otp', authController.verifyOTP);
app.post('/api/auth/reset-password', authController.resetPasswordWithOTP);
app.post('/api/auth/forgot-password', authController.forgotPassword);
app.post('/api/auth/reset-password-token', authController.resetPassword);
app.get('/api/auth/verify-reset-token/:token', authController.verifyResetToken);

// Centralized error handler (optional, can be improved)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
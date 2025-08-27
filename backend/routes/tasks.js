const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');

// Task CRUD - all endpoints require authentication
router.post('/', verifyToken, taskController.createTask);
router.get('/', verifyToken, taskController.getAllTasks);
// Admin endpoint to get tasks for a specific user (must be before ':id')
router.get('/user/:userId', verifyToken, taskController.getTasksByUserId);
router.get('/:id', verifyToken, taskController.getTaskById);
router.put('/:id', verifyToken, taskController.updateTask);
router.delete('/:id', verifyToken, taskController.deleteTask);

module.exports = router; 
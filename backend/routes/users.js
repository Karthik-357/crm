const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// User management (admin only)
router.get('/', verifyToken, isAdmin, userController.getAllUsers);
router.post('/', verifyToken, isAdmin, userController.createUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);
router.put('/:id', verifyToken, isAdmin, userController.updateUser);

// User settings (self or admin)
router.get('/:id/settings', verifyToken, userController.getUserSettings);
router.put('/:id/settings', verifyToken, userController.updateUserSettings);

module.exports = router; 
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware/auth');

// Activity CRUD
router.post('/', verifyToken, activityController.createActivity);
router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.put('/:id', verifyToken, activityController.updateActivity);
router.delete('/:id', verifyToken, activityController.deleteActivity);

module.exports = router; 
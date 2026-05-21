const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// Public routes
router.get('/:userId', NotificationController.getAll);
router.get('/:userId/recent', NotificationController.getRecent);
router.get('/:userId/unread-count', NotificationController.getUnreadCount);
router.post('/', NotificationController.create);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/:userId/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.delete);

module.exports = router;
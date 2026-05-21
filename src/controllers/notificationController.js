const NotificationModel = require('../models/notificationModel');

class NotificationController {
  static async getAll(req, res) {
    try {
      const { userId } = req.params;
      const { read, type, limit } = req.query;
      const filters = {};
      
      if (read !== undefined) filters.read = read;
      if (type) filters.type = type;
      if (limit) filters.limit = limit;
      
      const notifications = NotificationModel.getAll(userId, filters);
      const unreadCount = NotificationModel.getUnreadCount(userId);
      
      res.json({
        success: true,
        count: notifications.length,
        unreadCount,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching notifications',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { user_id, type, title, message } = req.body;
      
      if (!user_id || !type || !title) {
        return res.status(400).json({
          success: false,
          message: 'User ID, type, and title are required'
        });
      }
      
      const notification = NotificationModel.create({ user_id, type, title, message });
      
      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating notification',
        error: error.message
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      
      NotificationModel.markAsRead(id);
      
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read',
        error: error.message
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const { userId } = req.params;
      
      NotificationModel.markAllAsRead(userId);
      
      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking all notifications as read',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      NotificationModel.delete(id);
      
      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting notification',
        error: error.message
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const { userId } = req.params;
      const count = NotificationModel.getUnreadCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching unread count',
        error: error.message
      });
    }
  }

  static async getRecent(req, res) {
    try {
      const { userId } = req.params;
      const { limit } = req.query;
      
      const notifications = NotificationModel.getRecentNotifications(userId, parseInt(limit) || 10);
      
      res.json({
        success: true,
        count: notifications.length,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching recent notifications',
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
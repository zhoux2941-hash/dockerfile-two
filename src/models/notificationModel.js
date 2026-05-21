const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class NotificationModel {
  static getAll(userId, filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    const params = [userId];
    
    if (filters.read !== undefined) {
      query += ' AND read = ?';
      params.push(filters.read === 'true' ? 1 : 0);
    }
    
    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    return db.prepare(query).all(...params);
  }

  static getUnreadCount(userId) {
    const db = getDb();
    const result = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(userId);
    return result.count;
  }

  static getById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
  }

  static create(notificationData) {
    const db = getDb();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, notificationData.user_id, notificationData.type, notificationData.title, notificationData.message);
    
    return this.getById(id);
  }

  static markAsRead(id) {
    const db = getDb();
    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE id = ?');
    return stmt.run(id);
  }

  static markAllAsRead(userId) {
    const db = getDb();
    const stmt = db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?');
    return stmt.run(userId);
  }

  static delete(id) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
    return stmt.run(id);
  }

  static deleteByUser(userId) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM notifications WHERE user_id = ?');
    return stmt.run(userId);
  }

  static getRecentNotifications(userId, limit = 10) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);
  }

  static getByType(userId, type) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? AND type = ?
      ORDER BY created_at DESC
    `).all(userId, type);
  }
}

module.exports = NotificationModel;
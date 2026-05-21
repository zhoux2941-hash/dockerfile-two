const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CommentModel {
  static getByTaskId(taskId) {
    const db = getDb();
    return db.prepare(`
      SELECT c.*, u.username as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `).all(taskId);
  }

  static getById(id) {
    const db = getDb();
    return db.prepare(`
      SELECT c.*, u.username as user_name
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(id);
  }

  static create(commentData) {
    const db = getDb();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO comments (id, task_id, user_id, content)
      VALUES (?, ?, ?, ?)
    `);
    
    stmt.run(id, commentData.task_id, commentData.user_id, commentData.content);
    
    return this.getById(id);
  }

  static update(id, content) {
    const db = getDb();
    
    const stmt = db.prepare(`
      UPDATE comments 
      SET content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(content, id);
    
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM comments WHERE id = ?');
    return stmt.run(id);
  }

  static getCommentsByUser(userId) {
    const db = getDb();
    return db.prepare(`
      SELECT c.*, t.title as task_title, p.name as project_name
      FROM comments c
      LEFT JOIN tasks t ON c.task_id = t.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `).all(userId);
  }

  static searchComments(searchTerm) {
    const db = getDb();
    const searchPattern = `%${searchTerm}%`;
    
    return db.prepare(`
      SELECT c.*, u.username as user_name, t.title as task_title
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN tasks t ON c.task_id = t.id
      WHERE c.content LIKE ?
      ORDER BY c.created_at DESC
    `).all(searchPattern);
  }
}

module.exports = CommentModel;
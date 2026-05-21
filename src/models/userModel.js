const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class UserModel {
  static getAll() {
    const db = getDb();
    return db.prepare('SELECT id, username, email, role, created_at, updated_at FROM users').all();
  }

  static getById(id) {
    const db = getDb();
    return db.prepare('SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?').get(id);
  }

  static getByUsername(username) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  static getByEmail(email) {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static create(userData) {
    const db = getDb();
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(userData.password, 10);
    
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    try {
      stmt.run(id, userData.username, userData.email, passwordHash, userData.role || 'user');
      return this.getById(id);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static update(id, userData) {
    const db = getDb();
    const updates = [];
    const params = [];
    
    if (userData.username) {
      updates.push('username = ?');
      params.push(userData.username);
    }
    if (userData.email) {
      updates.push('email = ?');
      params.push(userData.email);
    }
    if (userData.password) {
      updates.push('password_hash = ?');
      params.push(bcrypt.hashSync(userData.password, 10));
    }
    if (userData.role) {
      updates.push('role = ?');
      params.push(userData.role);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static verifyPassword(username, password) {
    const user = this.getByUsername(username);
    if (!user) return null;
    
    if (bcrypt.compareSync(password, user.password_hash)) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }

  static getUserStats(userId) {
    const db = getDb();
    
    const tasksCreated = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE reporter_id = ?').get(userId);
    const tasksAssigned = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ?').get(userId);
    const tasksCompleted = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE assignee_id = ? AND status = ?').get(userId, 'completed');
    const projectsOwned = db.prepare('SELECT COUNT(*) as count FROM projects WHERE owner_id = ?').get(userId);
    
    return {
      tasksCreated: tasksCreated.count,
      tasksAssigned: tasksAssigned.count,
      tasksCompleted: tasksCompleted.count,
      projectsOwned: projectsOwned.count
    };
  }
}

module.exports = UserModel;
const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class TaskModel {
  static getAll(filters = {}) {
    const db = getDb();
    let query = `
      SELECT t.*, 
             p.name as project_name,
             a.username as assignee_name,
             r.username as reporter_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users a ON t.assignee_id = a.id
      LEFT JOIN users r ON t.reporter_id = r.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.project_id) {
      query += ' AND t.project_id = ?';
      params.push(filters.project_id);
    }
    
    if (filters.assignee_id) {
      query += ' AND t.assignee_id = ?';
      params.push(filters.assignee_id);
    }
    
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }
    
    if (filters.search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    return db.prepare(query).all(...params);
  }

  static getById(id) {
    const db = getDb();
    const task = db.prepare(`
      SELECT t.*, 
             p.name as project_name,
             a.username as assignee_name,
             r.username as reporter_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users a ON t.assignee_id = a.id
      LEFT JOIN users r ON t.reporter_id = r.id
      WHERE t.id = ?
    `).get(id);
    
    if (task) {
      // Get comments
      const comments = db.prepare(`
        SELECT c.*, u.username as user_name
        FROM comments c
        LEFT JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at ASC
      `).all(id);
      task.comments = comments;
      
      // Get tags
      const tags = db.prepare('SELECT tag FROM task_tags WHERE task_id = ?').all(id);
      task.tags = tags.map(t => t.tag);
    }
    
    return task;
  }

  static create(taskData) {
    const db = getDb();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO tasks (id, title, description, project_id, assignee_id, reporter_id, status, priority, estimated_hours, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      taskData.title,
      taskData.description,
      taskData.project_id,
      taskData.assignee_id,
      taskData.reporter_id,
      taskData.status || 'pending',
      taskData.priority || 'medium',
      taskData.estimated_hours,
      taskData.due_date
    );
    
    // Add tags if provided
    if (taskData.tags && Array.isArray(taskData.tags)) {
      const insertTag = db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
      taskData.tags.forEach(tag => {
        insertTag.run(id, tag);
      });
    }
    
    return this.getById(id);
  }

  static update(id, taskData) {
    const db = getDb();
    const updates = [];
    const params = [];
    
    const fields = ['title', 'description', 'project_id', 'assignee_id', 'reporter_id', 'status', 'priority', 'estimated_hours', 'actual_hours', 'due_date'];
    
    fields.forEach(field => {
      if (taskData[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(taskData[field]);
      }
    });
    
    // Handle completed_at
    if (taskData.status === 'completed' && !taskData.completed_at) {
      updates.push('completed_at = CURRENT_TIMESTAMP');
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    // Update tags if provided
    if (taskData.tags !== undefined) {
      db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id);
      if (Array.isArray(taskData.tags) && taskData.tags.length > 0) {
        const insertTag = db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
        taskData.tags.forEach(tag => {
          insertTag.run(id, tag);
        });
      }
    }
    
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    db.prepare('DELETE FROM task_tags WHERE task_id = ?').run(id);
    db.prepare('DELETE FROM comments WHERE task_id = ?').run(id);
    db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return { success: true };
  }

  static getTasksByUser(userId, role = 'assignee') {
    const db = getDb();
    const column = role === 'reporter' ? 'reporter_id' : 'assignee_id';
    
    return db.prepare(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.${column} = ?
      ORDER BY t.created_at DESC
    `).all(userId);
  }

  static getOverdueTasks() {
    const db = getDb();
    return db.prepare(`
      SELECT t.*, p.name as project_name, a.username as assignee_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users a ON t.assignee_id = a.id
      WHERE t.due_date < date('now')
        AND t.status NOT IN ('completed', 'cancelled')
      ORDER BY t.due_date ASC
    `).all();
  }

  static searchTasks(searchTerm) {
    const db = getDb();
    const searchPattern = `%${searchTerm}%`;
    
    return db.prepare(`
      SELECT t.*, 
             p.name as project_name,
             a.username as assignee_name,
             r.username as reporter_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users a ON t.assignee_id = a.id
      LEFT JOIN users r ON t.reporter_id = r.id
      WHERE t.title LIKE ? OR t.description LIKE ?
      ORDER BY t.created_at DESC
    `).all(searchPattern, searchPattern);
  }

  static getTasksByTag(tag) {
    const db = getDb();
    return db.prepare(`
      SELECT t.*, p.name as project_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN task_tags tt ON t.id = tt.task_id
      WHERE tt.tag = ?
      ORDER BY t.created_at DESC
    `).all(tag);
  }
}

module.exports = TaskModel;
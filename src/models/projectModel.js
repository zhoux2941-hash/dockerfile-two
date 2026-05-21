const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class ProjectModel {
  static getAll(filters = {}) {
    const db = getDb();
    let query = 'SELECT p.*, u.username as owner_name FROM projects p LEFT JOIN users u ON p.owner_id = u.id';
    const conditions = [];
    const params = [];
    
    if (filters.status) {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }
    
    if (filters.priority) {
      conditions.push('p.priority = ?');
      params.push(filters.priority);
    }
    
    if (filters.owner_id) {
      conditions.push('p.owner_id = ?');
      params.push(filters.owner_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY p.created_at DESC';
    
    return db.prepare(query).all(...params);
  }

  static getById(id) {
    const db = getDb();
    const project = db.prepare(`
      SELECT p.*, u.username as owner_name 
      FROM projects p 
      LEFT JOIN users u ON p.owner_id = u.id 
      WHERE p.id = ?
    `).get(id);
    
    if (project) {
      // Get project tasks
      const tasks = db.prepare('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC').all(id);
      project.tasks = tasks;
      
      // Get team members
      const members = db.prepare(`
        SELECT DISTINCT u.id, u.username, u.email, u.role
        FROM users u
        LEFT JOIN tasks t ON t.assignee_id = u.id OR t.reporter_id = u.id
        WHERE t.project_id = ?
      `).all(id);
      project.members = members;
    }
    
    return project;
  }

  static create(projectData) {
    const db = getDb();
    const id = uuidv4();
    
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description, owner_id, status, priority, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      projectData.name,
      projectData.description,
      projectData.owner_id,
      projectData.status || 'planning',
      projectData.priority || 'medium',
      projectData.start_date,
      projectData.end_date
    );
    
    return this.getById(id);
  }

  static update(id, projectData) {
    const db = getDb();
    const updates = [];
    const params = [];
    
    const fields = ['name', 'description', 'owner_id', 'status', 'priority', 'start_date', 'end_date'];
    
    fields.forEach(field => {
      if (projectData[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(projectData[field]);
      }
    });
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    const stmt = db.prepare(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...params);
    
    return this.getById(id);
  }

  static delete(id) {
    const db = getDb();
    // First delete all related tasks
    db.prepare('DELETE FROM task_tags WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?)').run(id);
    db.prepare('DELETE FROM comments WHERE task_id IN (SELECT id FROM tasks WHERE project_id = ?)').run(id);
    db.prepare('DELETE FROM tasks WHERE project_id = ?').run(id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return { success: true };
  }

  static getProjectStats(projectId) {
    const db = getDb();
    
    const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ?').get(projectId);
    const completedTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = ?').get(projectId, 'completed');
    const inProgressTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = ?').get(projectId, 'in_progress');
    const pendingTasks = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE project_id = ? AND status = ?').get(projectId, 'pending');
    
    const totalHours = db.prepare('SELECT SUM(estimated_hours) as total FROM tasks WHERE project_id = ?').get(projectId);
    const actualHours = db.prepare('SELECT SUM(actual_hours) as total FROM tasks WHERE project_id = ?').get(projectId);
    
    return {
      totalTasks: totalTasks.count,
      completedTasks: completedTasks.count,
      inProgressTasks: inProgressTasks.count,
      pendingTasks: pendingTasks.count,
      estimatedHours: totalHours.total || 0,
      actualHours: actualHours.total || 0,
      completionRate: totalTasks.count > 0 ? ((completedTasks.count / totalTasks.count) * 100).toFixed(2) : 0
    };
  }

  static searchProjects(searchTerm) {
    const db = getDb();
    const searchPattern = `%${searchTerm}%`;
    
    return db.prepare(`
      SELECT p.*, u.username as owner_name
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      WHERE p.name LIKE ? OR p.description LIKE ?
      ORDER BY p.created_at DESC
    `).all(searchPattern, searchPattern);
  }
}

module.exports = ProjectModel;
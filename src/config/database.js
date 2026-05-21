const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../../data/tasks.db');

let db = null;
let SQL = null;

async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

function getDb() {
  return db;
}

async function initializeDatabase() {
  const sqlPromise = await initSQL();
  
  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new sqlPromise.Database(fileBuffer);
  } else {
    db = new sqlPromise.Database();
  }
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create tables with intentional bugs for testing scenarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      priority TEXT DEFAULT 'medium',
      start_date DATE,
      end_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      project_id TEXT,
      assignee_id TEXT,
      reporter_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      estimated_hours REAL,
      actual_hours REAL DEFAULT 0,
      due_date DATE,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id),
      FOREIGN KEY (reporter_id) REFERENCES users(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS task_tags (
      task_id TEXT NOT NULL,
      tag TEXT NOT NULL,
      PRIMARY KEY (task_id, tag),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id TEXT,
      changes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run('CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)');
  
  // Seed initial data
  seedData(db);
  
  // Save database to file
  saveDatabase();
  
  console.log('Database initialized successfully');
}

function seedData(db) {
  const result = db.exec('SELECT COUNT(*) as count FROM users');
  const count = result.length > 0 ? result[0].values[0][0] : 0;
  
  if (count === 0) {
    // Create test users with different roles
    const users = [
      { id: 'user-001', username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { id: 'user-002', username: 'john_doe', email: 'john@example.com', password: 'password123', role: 'user' },
      { id: 'user-003', username: 'jane_smith', email: 'jane@example.com', password: 'password123', role: 'user' },
      { id: 'user-004', username: 'bob_wilson', email: 'bob@example.com', password: 'password123', role: 'manager' }
    ];
    
    const insertUser = db.prepare('INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    
    users.forEach(user => {
      const passwordHash = bcrypt.hashSync(user.password, 10);
      insertUser.run([user.id, user.username, user.email, passwordHash, user.role]);
    });
    insertUser.free();
    
    // Create sample projects
    const projects = [
      { id: 'proj-001', name: 'Website Redesign', description: 'Complete overhaul of company website', owner_id: 'user-004', status: 'active', priority: 'high' },
      { id: 'proj-002', name: 'Mobile App Development', description: 'Native mobile application for iOS and Android', owner_id: 'user-004', status: 'active', priority: 'high' },
      { id: 'proj-003', name: 'API Integration', description: 'Integration with third-party services', owner_id: 'user-002', status: 'planning', priority: 'medium' }
    ];
    
    const insertProject = db.prepare('INSERT INTO projects (id, name, description, owner_id, status, priority) VALUES (?, ?, ?, ?, ?, ?)');
    
    projects.forEach(proj => {
      insertProject.run([proj.id, proj.name, proj.description, proj.owner_id, proj.status, proj.priority]);
    });
    insertProject.free();
    
    // Create sample tasks
    const tasks = [
      { id: 'task-001', title: 'Design homepage mockup', description: 'Create wireframes and high-fidelity mockups for the new homepage', project_id: 'proj-001', assignee_id: 'user-002', reporter_id: 'user-004', status: 'in_progress', priority: 'high', estimated_hours: 16 },
      { id: 'task-002', title: 'Implement user authentication', description: 'Build login and registration system with JWT tokens', project_id: 'proj-001', assignee_id: 'user-003', reporter_id: 'user-002', status: 'pending', priority: 'high', estimated_hours: 24 },
      { id: 'task-003', title: 'Set up CI/CD pipeline', description: 'Configure automated testing and deployment workflows', project_id: 'proj-002', assignee_id: 'user-002', reporter_id: 'user-004', status: 'pending', priority: 'medium', estimated_hours: 8 },
      { id: 'task-004', title: 'Write API documentation', description: 'Document all REST API endpoints with examples', project_id: 'proj-003', assignee_id: 'user-003', reporter_id: 'user-002', status: 'completed', priority: 'low', estimated_hours: 12 },
      { id: 'task-005', title: 'Database schema optimization', description: 'Improve query performance and add indexes', project_id: 'proj-003', assignee_id: null, reporter_id: 'user-004', status: 'pending', priority: 'high', estimated_hours: 20 }
    ];
    
    const insertTask = db.prepare('INSERT INTO tasks (id, title, description, project_id, assignee_id, reporter_id, status, priority, estimated_hours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    tasks.forEach(task => {
      insertTask.run([task.id, task.title, task.description, task.project_id, task.assignee_id, task.reporter_id, task.status, task.priority, task.estimated_hours]);
    });
    insertTask.free();
    
    // Add sample comments
    const comments = [
      { id: 'comment-001', task_id: 'task-001', user_id: 'user-004', content: 'Great progress on the mockups!' },
      { id: 'comment-002', task_id: 'task-001', user_id: 'user-002', content: 'Thanks! I will have the final version ready by Friday.' },
      { id: 'comment-003', task_id: 'task-002', user_id: 'user-002', content: 'Should we use OAuth2 or simple JWT?' },
      { id: 'comment-004', task_id: 'task-003', user_id: 'user-004', content: 'Let us use GitHub Actions for the CI/CD pipeline.' }
    ];
    
    const insertComment = db.prepare('INSERT INTO comments (id, task_id, user_id, content) VALUES (?, ?, ?, ?)');
    
    comments.forEach(c => {
      insertComment.run([c.id, c.task_id, c.user_id, c.content]);
    });
    insertComment.free();
    
    // Add sample notifications
    const notifications = [
      { id: 'notif-001', user_id: 'user-002', type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned to "Design homepage mockup"' },
      { id: 'notif-002', user_id: 'user-003', type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned to "Implement user authentication"' },
      { id: 'notif-003', user_id: 'user-004', type: 'comment', title: 'New Comment', message: 'New comment on "Design homepage mockup"' }
    ];
    
    const insertNotification = db.prepare('INSERT INTO notifications (id, user_id, type, title, message) VALUES (?, ?, ?, ?, ?)');
    
    notifications.forEach(n => {
      insertNotification.run([n.id, n.user_id, n.type, n.title, n.message]);
    });
    insertNotification.free();
    
    // Add task tags
    const tags = [
      { task_id: 'task-001', tag: 'design' },
      { task_id: 'task-001', tag: 'frontend' },
      { task_id: 'task-002', tag: 'backend' },
      { task_id: 'task-002', tag: 'security' },
      { task_id: 'task-003', tag: 'devops' },
      { task_id: 'task-004', tag: 'documentation' }
    ];
    
    const insertTag = db.prepare('INSERT INTO task_tags (task_id, tag) VALUES (?, ?)');
    
    tags.forEach(t => {
      insertTag.run([t.task_id, t.tag]);
    });
    insertTag.free();
    
    console.log('Sample data seeded successfully');
  }
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

// Helper functions to match better-sqlite3 API
function wrapDb(db) {
  return {
    prepare: (sql) => {
      const stmt = db.prepare(sql);
      return {
        run: (...params) => {
          if (params.length === 1 && Array.isArray(params[0])) {
            stmt.bind(params[0]);
          } else {
            stmt.bind(params);
          }
          stmt.step();
          stmt.free();
        },
        get: (...params) => {
          if (params.length === 1 && Array.isArray(params[0])) {
            stmt.bind(params[0]);
          } else {
            stmt.bind(params);
          }
          if (stmt.step()) {
            const row = stmt.getAsObject();
            stmt.free();
            return row;
          }
          stmt.free();
          return null;
        },
        all: (...params) => {
          if (params.length === 1 && Array.isArray(params[0])) {
            stmt.bind(params[0]);
          } else {
            stmt.bind(params);
          }
          const results = [];
          while (stmt.step()) {
            results.push(stmt.getAsObject());
          }
          stmt.free();
          return results;
        }
      };
    },
    exec: (sql) => db.exec(sql),
    run: (sql, ...params) => {
      if (params.length === 1 && Array.isArray(params[0])) {
        db.run(sql, params[0]);
      } else {
        db.run(sql, params);
      }
    }
  };
}

module.exports = {
  getDb: () => db ? wrapDb(db) : null,
  initializeDatabase,
  closeDatabase,
  saveDatabase
};
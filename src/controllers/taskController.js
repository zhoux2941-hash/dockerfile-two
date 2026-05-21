const TaskModel = require('../models/taskModel');
const NotificationService = require('../services/notificationService');

class TaskController {
  static async getAll(req, res) {
    try {
      const { project_id, assignee_id, status, priority, search } = req.query;
      const filters = {};
      
      if (project_id) filters.project_id = project_id;
      if (assignee_id) filters.assignee_id = assignee_id;
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (search) filters.search = search;
      
      const tasks = TaskModel.getAll(filters);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const task = TaskModel.getById(req.params.id);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching task',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { title, description, project_id, assignee_id, reporter_id, status, priority, estimated_hours, due_date, tags } = req.body;
      
      if (!title || !reporter_id) {
        return res.status(400).json({
          success: false,
          message: 'Title and reporter_id are required'
        });
      }
      
      const task = TaskModel.create({
        title,
        description,
        project_id,
        assignee_id,
        reporter_id,
        status,
        priority,
        estimated_hours,
        due_date,
        tags
      });
      
      // Send notification if task is assigned
      if (assignee_id) {
        await NotificationService.sendTaskAssignment(task);
      }
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating task',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const oldTask = TaskModel.getById(req.params.id);
      
      if (!oldTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const task = TaskModel.update(req.params.id, req.body);
      
      // Send notification if assignee changed
      if (req.body.assignee_id && req.body.assignee_id !== oldTask.assignee_id) {
        await NotificationService.sendTaskAssignment(task);
      }
      
      // Send notification if task completed
      if (req.body.status === 'completed' && oldTask.status !== 'completed') {
        await NotificationService.sendTaskCompletion(task);
      }
      
      res.json({
        success: true,
        message: 'Task updated successfully',
        data: task
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating task',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      TaskModel.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting task',
        error: error.message
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
      const { role } = req.query;
      
      const tasks = TaskModel.getTasksByUser(userId, role || 'assignee');
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user tasks',
        error: error.message
      });
    }
  }

  static async getOverdue(req, res) {
    try {
      const tasks = TaskModel.getOverdueTasks();
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching overdue tasks',
        error: error.message
      });
    }
  }

  static async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const tasks = TaskModel.searchTasks(q);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching tasks',
        error: error.message
      });
    }
  }

  static async getByTag(req, res) {
    try {
      const { tag } = req.params;
      const tasks = TaskModel.getTasksByTag(tag);
      
      res.json({
        success: true,
        count: tasks.length,
        data: tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks by tag',
        error: error.message
      });
    }
  }
}

module.exports = TaskController;
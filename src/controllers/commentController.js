const CommentModel = require('../models/commentModel');
const TaskModel = require('../models/taskModel');

class CommentController {
  static async getByTask(req, res) {
    try {
      const { taskId } = req.params;
      
      const task = TaskModel.getById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const comments = CommentModel.getByTaskId(taskId);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching comments',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { task_id, user_id, content } = req.body;
      
      if (!task_id || !user_id || !content) {
        return res.status(400).json({
          success: false,
          message: 'Task ID, user ID, and content are required'
        });
      }
      
      const task = TaskModel.getById(task_id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const comment = CommentModel.create({ task_id, user_id, content });
      
      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating comment',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({
          success: false,
          message: 'Content is required'
        });
      }
      
      const comment = CommentModel.update(id, content);
      
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Comment updated successfully',
        data: comment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating comment',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      CommentModel.delete(id);
      
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting comment',
        error: error.message
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const { userId } = req.params;
      
      const comments = CommentModel.getCommentsByUser(userId);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user comments',
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
      
      const comments = CommentModel.searchComments(q);
      
      res.json({
        success: true,
        count: comments.length,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching comments',
        error: error.message
      });
    }
  }
}

module.exports = CommentController;
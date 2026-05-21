const ProjectModel = require('../models/projectModel');

class ProjectController {
  static async getAll(req, res) {
    try {
      const { status, priority, owner_id } = req.query;
      const filters = {};
      
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (owner_id) filters.owner_id = owner_id;
      
      const projects = ProjectModel.getAll(filters);
      
      res.json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching projects',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const project = ProjectModel.getById(req.params.id);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      const stats = ProjectModel.getProjectStats(req.params.id);
      
      res.json({
        success: true,
        data: {
          ...project,
          stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching project',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { name, description, owner_id, status, priority, start_date, end_date } = req.body;
      
      if (!name || !owner_id) {
        return res.status(400).json({
          success: false,
          message: 'Name and owner_id are required'
        });
      }
      
      const project = ProjectModel.create({
        name,
        description,
        owner_id,
        status,
        priority,
        start_date,
        end_date
      });
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating project',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const project = ProjectModel.update(req.params.id, req.body);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating project',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      ProjectModel.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting project',
        error: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = ProjectModel.getProjectStats(req.params.id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching project stats',
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
      
      const projects = ProjectModel.searchProjects(q);
      
      res.json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error searching projects',
        error: error.message
      });
    }
  }
}

module.exports = ProjectController;
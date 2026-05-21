const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';

class UserController {
  static async getAll(req, res) {
    try {
      const users = UserModel.getAll();
      res.json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const user = UserModel.getById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const stats = UserModel.getUserStats(req.params.id);
      
      res.json({
        success: true,
        data: {
          ...user,
          stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  }

  static async create(req, res) {
    try {
      const { username, email, password, role } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        });
      }
      
      const user = UserModel.create({ username, email, password, role });
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const user = UserModel.update(req.params.id, req.body);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      UserModel.delete(req.params.id);
      
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      const user = UserModel.verifyPassword(username, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }
      
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = UserModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const stats = UserModel.getUserStats(req.user.id);
      
      res.json({
        success: true,
        data: {
          ...user,
          stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }
  }
}

module.exports = UserController;
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', UserController.login);

// Protected routes (would use authMiddleware in production)
router.get('/', UserController.getAll);
router.get('/profile', UserController.getProfile);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
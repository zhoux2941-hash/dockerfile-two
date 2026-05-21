const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');

// Public routes
router.get('/', TaskController.getAll);
router.get('/search', TaskController.search);
router.get('/overdue', TaskController.getOverdue);
router.get('/tag/:tag', TaskController.getByTag);
router.get('/user/:userId', TaskController.getByUser);
router.get('/:id', TaskController.getById);
router.post('/', TaskController.create);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

module.exports = router;
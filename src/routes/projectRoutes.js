const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');

// Public routes
router.get('/', ProjectController.getAll);
router.get('/search', ProjectController.search);
router.get('/:id', ProjectController.getById);
router.get('/:id/stats', ProjectController.getStats);
router.post('/', ProjectController.create);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

module.exports = router;
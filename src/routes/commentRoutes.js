const express = require('express');
const router = express.Router();
const CommentController = require('../controllers/commentController');

// Public routes
router.get('/task/:taskId', CommentController.getByTask);
router.get('/user/:userId', CommentController.getByUser);
router.get('/search', CommentController.search);
router.post('/', CommentController.create);
router.put('/:id', CommentController.update);
router.delete('/:id', CommentController.delete);

module.exports = router;
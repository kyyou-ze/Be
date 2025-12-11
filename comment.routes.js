// Routes/comment.routes.js
const express = require('express');
const router = express.Router();
const CommentController = require('../Controllers/CommentController');
const auth = require('../Middleware/auth');

// Get comments for a chapter
router.get('/:chapterId', CommentController.getComments);

// Add comment
router.post('/:chapterId', auth, CommentController.addComment);

// Delete comment (owner or admin)
router.delete('/:chapterId/:commentId', auth, CommentController.deleteComment);

module.exports = router;

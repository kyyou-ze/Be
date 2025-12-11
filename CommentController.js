// Controllers/CommentController.js
const CommentService = require('../Services/CommentService');

class CommentController {
  static async getComments(req, res, next) {
    try {
      const comments = await CommentService.getByChapter(req.params.chapterId);
      res.json({ success: true, comments });
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req, res, next) {
    try {
      const comment = await CommentService.add(req.user.id, req.params.chapterId, req.body);
      res.status(201).json({ success: true, comment });
    } catch (err) {
      next(err);
    }
  }

  static async deleteComment(req, res, next) {
    try {
      await CommentService.delete(req.user, req.params.chapterId, req.params.commentId);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CommentController;

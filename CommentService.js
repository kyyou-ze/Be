// Services/CommentService.js
const Comment = require('../Models/MongoDB/comment.model');

class CommentService {
  static async getByChapter(chapterId) {
    return await Comment.find({ chapter: chapterId }).populate('user');
  }

  static async add(userId, chapterId, data) {
    const comment = new Comment({ ...data, user: userId, chapter: chapterId });
    return await comment.save();
  }

  static async delete(user, chapterId, commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error('Comment not found');

    if (comment.user.toString() !== user.id && user.role !== 'admin') {
      throw new Error('Not authorized to delete');
    }

    return await Comment.findByIdAndDelete(commentId);
  }
}

module.exports = CommentService;

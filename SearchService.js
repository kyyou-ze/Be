// Services/SearchService.js
const Novel = require('../Models/MongoDB/novel.model');
const { pgPool } = require('../Config/db');

class SearchService {
  static async searchNovels(keyword) {
    return await Novel.find({ title: new RegExp(keyword, 'i') }).populate('genres');
  }

  static async searchUsers(keyword) {
    const result = await pgPool.query(
      'SELECT id, email, role FROM users WHERE email ILIKE $1',
      [`%${keyword}%`]
    );
    return result.rows;
  }
}

module.exports = SearchService;

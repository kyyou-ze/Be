// Services/ProgressService.js
const { pgPool } = require('../Config/db');

class ProgressService {
  static async trackProgress(userId, novelId, chapterId) {
    const result = await pgPool.query(
      `INSERT INTO reading_progress (user_id, novel_id, chapter_id, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, novel_id)
       DO UPDATE SET chapter_id = EXCLUDED.chapter_id, updated_at = NOW()
       RETURNING *`,
      [userId, novelId, chapterId]
    );
    return result.rows[0];
  }

  static async getProgress(userId, novelId) {
    const result = await pgPool.query(
      'SELECT * FROM reading_progress WHERE user_id = $1 AND novel_id = $2',
      [userId, novelId]
    );
    return result.rows[0];
  }
}

module.exports = ProgressService;

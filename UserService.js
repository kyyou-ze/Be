// Services/UserService.js
const { pgPool } = require('../Config/db');
const bcrypt = require('bcrypt');

class UserService {

  // ============================================================
  // CREATE USER
  // ============================================================
  static async createUser({ email, password, role = 'reader', username = null }) {
    const hashed = await bcrypt.hash(password, 10);

    const result = await pgPool.query(
      `INSERT INTO users (email, password, role, username)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, username`,
      [email, hashed, role, username]
    );

    return result.rows[0];
  }

  // ============================================================
  // AUTHENTICATE USER
  // ============================================================
  static async authenticate(email, password) {
    const result = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) throw new Error('User not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid credentials');

    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  }

  // ============================================================
  // GET ALL USERS
  // ============================================================
  static async getAll() {
    const result = await pgPool.query(
      `SELECT id, email, role, username, profile_photo FROM users`
    );
    return result.rows;
  }

  // ============================================================
  // GET USER BY ID
  // ============================================================
  static async getById(id) {
    const result = await pgPool.query(
      `SELECT *
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // ============================================================
  // UPDATE USER (GENERAL)
  // ============================================================
  static async update(id, data) {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in data) {
      fields.push(`${key} = $${index}`);
      values.push(data[key]);
      index++;
    }

    values.push(id);

    const result = await pgPool.query(
      `UPDATE users
       SET ${fields.join(', ')}
       WHERE id = $${index}
       RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // ============================================================
  // UPDATE PASSWORD
  // ============================================================
  static async updatePassword(id, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await pgPool.query(
      `UPDATE users
       SET password = $1
       WHERE id = $2
       RETURNING id, email, role`,
      [hashed, id]
    );

    return result.rows[0];
  }

  // ============================================================
  // BOOKMARKS
  // ============================================================
  static async addBookmark(userId, novelId) {
    const result = await pgPool.query(
      `UPDATE users
       SET bookmarks = array_append(bookmarks, $1)
       WHERE id = $2
       RETURNING bookmarks`,
      [novelId, userId]
    );
    return result.rows[0];
  }

  static async removeBookmark(userId, novelId) {
    const result = await pgPool.query(
      `UPDATE users
       SET bookmarks = array_remove(bookmarks, $1)
       WHERE id = $2
       RETURNING bookmarks`,
      [novelId, userId]
    );
    return result.rows[0];
  }

  // ============================================================
  // HISTORY
  // ============================================================
  static async addHistory(userId, chapterId) {
    const result = await pgPool.query(
      `UPDATE users
       SET history = array_append(history, $1)
       WHERE id = $2
       RETURNING history`,
      [chapterId, userId]
    );
    return result.rows[0];
  }

  static async clearHistory(userId) {
    await pgPool.query(
      `UPDATE users
       SET history = '{}'
       WHERE id = $1`,
      [userId]
    );
  }

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  static async addNotification(userId, notif) {
    const result = await pgPool.query(
      `UPDATE users
       SET notifications = notifications || $1::jsonb
       WHERE id = $2
       RETURNING notifications`,
      [JSON.stringify([notif]), userId]
    );
    return result.rows[0];
  }

  static async markNotificationRead(userId, notifId) {
    const result = await pgPool.query(
      `UPDATE users
       SET notifications = (
         SELECT jsonb_agg(
           CASE
             WHEN elem->>'id' = $1 THEN elem || '{"read": true}'
             ELSE elem
           END
         )
         FROM jsonb_array_elements(notifications) elem
       )
       WHERE id = $2
       RETURNING notifications`,
      [notifId, userId]
    );
    return result.rows[0];
  }

  static async clearNotifications(userId) {
    await pgPool.query(
      `UPDATE users
       SET notifications = '[]'
       WHERE id = $1`,
      [userId]
    );
  }

  // ============================================================
  // PREFERENCES
  // ============================================================
  static async updatePreferences(userId, prefs) {
    const result = await pgPool.query(
      `UPDATE users
       SET preferences = preferences || $1::jsonb
       WHERE id = $2
       RETURNING preferences`,
      [JSON.stringify(prefs), userId]
    );
    return result.rows[0];
  }

  // ============================================================
  // SESSIONS
  // ============================================================
  static async addSession(userId, session) {
    const result = await pgPool.query(
      `UPDATE users
       SET sessions = sessions || $1::jsonb
       WHERE id = $2
       RETURNING sessions`,
      [JSON.stringify([session]), userId]
    );
    return result.rows[0];
  }

  static async removeSession(userId, sessionId) {
    const result = await pgPool.query(
      `UPDATE users
       SET sessions = (
         SELECT jsonb_agg(elem)
         FROM jsonb_array_elements(sessions) elem
         WHERE elem->>'id' != $1
       )
       WHERE id = $2
       RETURNING sessions`,
      [sessionId, userId]
    );
    return result.rows[0];
  }

  // ============================================================
  // LEVELING SYSTEM
  // ============================================================
  static async addXP(userId, amount) {
    const result = await pgPool.query(
      `UPDATE users
       SET xp = xp + $1
       WHERE id = $2
       RETURNING xp, level`,
      [amount, userId]
    );
    return result.rows[0];
  }

  // ============================================================
  // CHECK-IN
  // ============================================================
  static async updateCheckin(userId, date, streak) {
    const result = await pgPool.query(
      `UPDATE users
       SET last_checkin = $1,
           checkin_streak = $2
       WHERE id = $3
       RETURNING last_checkin, checkin_streak`,
      [date, streak, userId]
    );
    return result.rows[0];
  }
}

module.exports = UserService;

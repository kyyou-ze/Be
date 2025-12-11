// Controllers/AuthController.js
const UserService = require('../Services/UserService');
const NovelService = require('../Services/NovelService');
const { generateToken } = require('../Utils/response');
const bcrypt = require('bcrypt');

const BASE_URL = 'https://api.limenovel.my.id';

class AuthController {
  // POST /api/auth/register
  static async register(req, res, next) {
    try {
      const { email, password, username } = req.body;
      const user = await UserService.createUser({ email, password, username, role: 'reader' });
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      res.status(201).json({ success: true, user, token });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserService.authenticate(email, password);
      const token = generateToken({ id: user.id, email: user.email, role: user.role });
      res.json({ success: true, user, token });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/profile
  static async getProfile(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.created_at,
        novelsRead: user.novels_read || 0,
        chaptersRead: user.chapters_read || 0,
        bookmarks: Array.isArray(user.bookmarks) ? user.bookmarks.length : 0,
        historyCount: Array.isArray(user.history) ? user.history.length : 0,
        profilePhoto: user.profile_photo
          ? user.profile_photo.startsWith('http')
            ? user.profile_photo
            : `${BASE_URL}${user.profile_photo}`
          : null
      };

      res.json({ success: true, user: payload });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/auth/profile
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const data = {};
      if (req.body.username !== undefined) data.username = req.body.username;
      if (req.body.email !== undefined) data.email = req.body.email;

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ success: false, message: 'No data to update' });
      }

      const updated = await UserService.update(userId, data);
      res.json({ success: true, user: updated });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/auth/password
  static async updatePassword(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Missing password fields' });
      }

      const user = await UserService.getById(userId);
      const match = await bcrypt.compare(oldPassword, user.password);
      if (!match) return res.status(400).json({ success: false, message: 'Old password incorrect' });

      await UserService.updatePassword(userId, newPassword);
      res.json({ success: true, message: 'Password updated' });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/profile/photo
  static async uploadProfilePhoto(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

      const fileUrl = `${BASE_URL}/uploads/profile/${req.file.filename}`;
      const updated = await UserService.update(userId, { profile_photo: fileUrl });

      res.json({ success: true, message: 'Profile photo updated', profilePhoto: fileUrl, user: updated });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/bookmarks
  static async getBookmarks(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      const ids = user.bookmarks || [];
      const novels = ids.length ? await NovelService.getByIds(ids) : [];
      res.json({ success: true, bookmarks: novels });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/bookmarks/:novelId
  static async addBookmark(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const novelId = parseInt(req.params.novelId, 10);
      const updated = await UserService.addBookmark(userId, novelId);
      res.json({ success: true, bookmarks: updated.bookmarks });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/auth/bookmarks/:novelId
  static async removeBookmark(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const novelId = parseInt(req.params.novelId, 10);
      const updated = await UserService.removeBookmark(userId, novelId);
      res.json({ success: true, bookmarks: updated.bookmarks });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/history
  static async getHistory(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      res.json({ success: true, history: user.history || [] });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/history/:chapterId
  static async addHistory(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const chapterId = parseInt(req.params.chapterId, 10);
      const updated = await UserService.addHistory(userId, chapterId);
      res.json({ success: true, history: updated.history });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/auth/history
  static async clearHistory(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await UserService.clearHistory(userId);
      res.json({ success: true, message: 'History cleared' });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/notifications
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      res.json({ success: true, notifications: user.notifications || [] });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/notifications/read/:id
  static async markNotificationRead(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const notifId = req.params.id;
      const updated = await UserService.markNotificationRead(userId, notifId);
      res.json({ success: true, notifications: updated.notifications });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/auth/notifications
  static async clearNotifications(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      await UserService.clearNotifications(userId);
      res.json({ success: true, message: 'Notifications cleared' });
    } catch (err) {
      next(err);
    }
  }

  // PUT /api/auth/preferences
  static async updatePreferences(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const prefs = req.body || {};
      const updated = await UserService.updatePreferences(userId, prefs);
      res.json({ success: true, preferences: updated.preferences });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/sessions
  static async getSessions(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      res.json({ success: true, sessions: user.sessions || [] });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /api/auth/sessions/:sessionId
  static async removeSession(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const sessionId = req.params.sessionId;
      const updated = await UserService.removeSession(userId, sessionId);
      res.json({ success: true, sessions: updated.sessions });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/level
  static async getLevel(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      res.json({ success: true, xp: user.xp || 0, level: user.level || 1 });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/level/add
  static async addXP(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const amount = parseInt(req.body.amount, 10) || 10;
      const updated = await UserService.addXP(userId, amount);
      res.json({ success: true, xp: updated.xp, level: updated.level });
    } catch (err) {
      next(err);
    }
  }

  // GET /api/auth/checkin
  static async getCheckin(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      res.json({
        success: true,
        lastCheckin: user.last_checkin || null,
        streak: user.checkin_streak || 0
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /api/auth/checkin
  static async checkin(req, res, next) {
    try {
      const userId = req.user && (req.user.id || req.user._id);
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const user = await UserService.getById(userId);
      const today = new Date().toISOString().slice(0, 10);
      let streak = user.checkin_streak || 0;

      if (user.last_checkin !== today) {
        // if last_checkin is yesterday, increment; otherwise reset to 1
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (user.last_checkin === yesterday) streak = streak + 1;
        else streak = 1;
      }

      const updated = await UserService.updateCheckin(userId, today, streak);
      res.json({ success: true, lastCheckin: updated.last_checkin, streak: updated.checkin_streak });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;

// Routes/auth.routes.js
const express = require('express');
const router = express.Router();

const AuthController = require('../Controllers/AuthController');
const auth = require('../Middleware/auth');
const uploadProfile = require('../Middleware/uploadProfile');
const validate = require('../Middleware/validate');
const { body, param } = require('express-validator');

// Public
router.post(
  '/register',
  validate([
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('username').optional().isString().isLength({ min: 3 })
  ]),
  AuthController.register
);

router.post(
  '/login',
  validate([
    body('email').isEmail(),
    body('password').notEmpty()
  ]),
  AuthController.login
);

// Profile
router.get('/profile', auth, AuthController.getProfile);

router.put(
  '/profile',
  auth,
  validate([
    body('username').optional().isString().isLength({ min: 3 }),
    body('email').optional().isEmail()
  ]),
  AuthController.updateProfile
);

router.post(
  '/profile/photo',
  auth,
  uploadProfile.single('photo'),
  AuthController.uploadProfilePhoto
);

// Password
router.put(
  '/password',
  auth,
  validate([
    body('oldPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 })
  ]),
  AuthController.updatePassword
);

// Bookmarks
router.get('/bookmarks', auth, AuthController.getBookmarks);

router.post(
  '/bookmarks/:novelId',
  auth,
  validate([ param('novelId').isInt() ]),
  AuthController.addBookmark
);

router.delete(
  '/bookmarks/:novelId',
  auth,
  validate([ param('novelId').isInt() ]),
  AuthController.removeBookmark
);

// History
router.get('/history', auth, AuthController.getHistory);

router.post(
  '/history/:chapterId',
  auth,
  validate([ param('chapterId').isInt() ]),
  AuthController.addHistory
);

router.delete('/history', auth, AuthController.clearHistory);

// Notifications
router.get('/notifications', auth, AuthController.getNotifications);

router.post(
  '/notifications/read/:id',
  auth,
  validate([ param('id').isString().notEmpty() ]),
  AuthController.markNotificationRead
);

router.delete('/notifications', auth, AuthController.clearNotifications);

// Preferences
router.put(
  '/preferences',
  auth,
  validate([ body().isObject().optional() ]),
  AuthController.updatePreferences
);

// Sessions
router.get('/sessions', auth, AuthController.getSessions);

router.delete(
  '/sessions/:sessionId',
  auth,
  validate([ param('sessionId').isString().notEmpty() ]),
  AuthController.removeSession
);

// Leveling / XP
router.get('/level', auth, AuthController.getLevel);

router.post(
  '/level/add',
  auth,
  validate([ body('amount').optional().isInt({ min: 1 }) ]),
  AuthController.addXP
);

// Check-in
router.get('/checkin', auth, AuthController.getCheckin);
router.post('/checkin', auth, AuthController.checkin);

module.exports = router;

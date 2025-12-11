// Routes/user.routes.js
const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserController');
const auth = require('../Middleware/auth');
const role = require('../Middleware/role');

// Get all users (admin only)
router.get('/', auth, role(['admin']), UserController.getAllUsers);

// Get profile
router.get('/profile', auth, UserController.getProfile);

// Update profile
router.put('/profile', auth, UserController.updateProfile);

module.exports = router;

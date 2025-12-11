// Routes/genre.routes.js
const express = require('express');
const router = express.Router();
const GenreController = require('../Controllers/GenreController');
const auth = require('../Middleware/auth');
const role = require('../Middleware/role');

// Get all genres
router.get('/', GenreController.getAllGenres);

// Create genre (admin only)
router.post('/', auth, role(['admin']), GenreController.createGenre);

module.exports = router;

// Utils/response.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN = '1d' } = require('../Config/env');

const success = (res, data, status = 200) => res.status(status).json({ success: true, data });
const error = (res, message, status = 500) => res.status(status).json({ success: false, message });

const generateToken = (user) => {
  // Ambil id dari user._id (Mongoose) atau user.id (lain)
  const userId = user && (user._id ? user._id.toString() : user.id ? user.id : null);
  const payload = {
    id: userId,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Formatter opsional untuk menyamakan shape JSON seperti contohmu
const formatNovel = (novel) => ({
  id: novel._id.toString(),
  img: novel.img || null,
  title: novel.title,
  year: novel.year || '',
  summary: novel.summary || '',
  status: novel.status,
  type: novel.type || '',
  genre1: novel.genre1 || '',
  genre2: novel.genre2 || '',
  rating: novel.rating || '',
  chapters: (novel.chapters || []).map(ch => ({
    title: ch.title,
    views: ch.views || 0,
    content: ch.contentPath || ch.content || '',
    updatedAt: ch.updatedAt
  })),
  updatedAt: novel.updatedAt
});

module.exports = { success, error, generateToken, formatNovel };

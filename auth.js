// Middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/env');
const logger = require('../Config/logger');
const UserService = require('../Services/UserService');

const auth = async (req, res, next) => {
  try {
    const header = req.headers['authorization'];
    if (!header) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ success: false, message: 'Invalid token format' });
    }

    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      logger.error('JWT verification failed', err);
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    // Ambil user dari DB untuk memastikan user masih ada dan data up-to-date
    const user = await UserService.getById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Lampirkan data user minimal ke req.user (hindari menyertakan password)
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    logger.error('Auth middleware error', err);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = auth;


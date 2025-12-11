// Controllers/UserController.js
const UserService = require('../Services/UserService');

class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const users = await UserService.getAll();
      res.json({ success: true, users });
    } catch (err) {
      next(err);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserService.getById(req.user.id);
      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updated = await UserService.update(req.user.id, req.body);
      res.json({ success: true, user: updated });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;

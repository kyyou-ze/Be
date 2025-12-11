// Controllers/GenreController.js
const GenreService = require('../Services/NovelService'); // bisa dipisah ke GenreService

class GenreController {
  static async getAllGenres(req, res, next) {
    try {
      const genres = await GenreService.getGenres();
      res.json({ success: true, genres });
    } catch (err) {
      next(err);
    }
  }

  static async createGenre(req, res, next) {
    try {
      const genre = await GenreService.createGenre(req.body);
      res.status(201).json({ success: true, genre });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = GenreController;

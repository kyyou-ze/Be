// Controllers/NovelController.js
const NovelService = require('../Services/NovelService');
const { formatNovel } = require('../Utils/response');

// Sesuaikan dengan domain API kamu
const BASE_URL = 'https://api.limenovel.my.id';

class NovelController {
  // Ambil semua novel
  static async getAllNovels(req, res, next) {
    try {
      const novels = await NovelService.getAll();
      res.json({ success: true, novels: novels.map(formatNovel) });
    } catch (err) {
      next(err);
    }
  }

  // Ambil novel berdasarkan ID
  static async getNovelById(req, res, next) {
    try {
      const novel = await NovelService.getById(req.params.id);
      res.json({ success: true, novel: formatNovel(novel) });
    } catch (err) {
      next(err);
    }
  }

  // Buat novel baru (dengan cover optional)
  static async createNovel(req, res, next) {
    try {
      const authorId = req.user && (req.user.id || req.user._id);
      if (!authorId) {
        return res.status(401).json({ success: false, message: 'Author (from token) missing' });
      }

      const title = (req.body.title || '').toString().trim();
      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      const data = {
        title,
        summary: req.body.summary || '',
        year: req.body.year || '',
        status: req.body.status || 'Ongoing',
        type: req.body.type || '',
        genre1: req.body.genre1 || '',
        genre2: req.body.genre2 || '',
        genre3: req.body.genre3 || '',
        rating: req.body.rating || '',
        genres: req.body.genres
          ? (Array.isArray(req.body.genres) ? req.body.genres : [req.body.genres])
          : [],
        img: req.file
          ? `${BASE_URL}/uploads/novels/${req.file.filename}`
          : undefined,
        author: authorId
      };

      const novel = await NovelService.create(data);
      res.status(201).json({ success: true, novel: formatNovel(novel) });
    } catch (err) {
      next(err);
    }
  }

  // Update novel (tanpa cover) — hindari mengosongkan img tanpa sengaja
  static async updateNovel(req, res, next) {
    try {
      const payload = { ...req.body };

      // Jika service kamu overwrite seluruh dokumen, amankan agar img tidak dihapus saat tidak dikirim
      if (payload.img === undefined) {
        // biarkan service melakukan merge; jika service tidak merge, ambil current dan gabungkan di service
      }

      const novel = await NovelService.update(req.params.id, payload);
      res.json({ success: true, novel: formatNovel(novel) });
    } catch (err) {
      next(err);
    }
  }

  // Hapus novel
  static async deleteNovel(req, res, next) {
    try {
      await NovelService.remove(req.params.id);
      res.json({ success: true, message: 'Novel deleted' });
    } catch (err) {
      next(err);
    }
  }

  // Upload / update cover novel — logika sama dengan ChapterController, simpan URL penuh
  static async uploadCover(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const fileUrl = `${BASE_URL}/uploads/novels/${req.file.filename}`;
      const novel = await NovelService.setCover(req.params.id, fileUrl);
      res.status(201).json({ success: true, novel: formatNovel(novel) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = NovelController;


// Controllers/ChapterController.js
const NovelService = require('../Services/NovelService');
const { formatChapter } = require('../Utils/response'); // sesuaikan jika tidak ada
const BASE_URL = 'https://api.limenovel.my.id'; // sesuaikan domain API

class ChapterController {
  // Ambil semua chapter untuk sebuah novel
  static async getChapters(req, res, next) {
    try {
      const chapters = await NovelService.getChapters(req.params.novelId);
      // Jika ada helper formatChapter, gunakan; jika tidak, kirim apa adanya
      const payload = typeof formatChapter === 'function'
        ? chapters.map(formatChapter)
        : chapters;
      res.json({ success: true, chapters: payload });
    } catch (err) {
      next(err);
    }
  }

  // Ambil chapter berdasarkan id
  static async getChapterById(req, res, next) {
    try {
      const chapter = await NovelService.getChapterById(req.params.novelId, req.params.chapterId);
      const payload = typeof formatChapter === 'function' ? formatChapter(chapter) : chapter;
      res.json({ success: true, chapter: payload });
    } catch (err) {
      next(err);
    }
  }

  // Buat chapter baru (mengharuskan file diupload)
  static async createChapter(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const title = (req.body.title || '').toString().trim();
      const order = req.body.order !== undefined ? parseInt(req.body.order, 10) || 0 : 0;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      const contentPath = `${BASE_URL}/uploads/chapters/${req.file.filename}`;

      const chapter = await NovelService.createChapter(req.params.novelId, {
        title,
        order,
        contentPath
      });

      const payload = typeof formatChapter === 'function' ? formatChapter(chapter) : chapter;
      res.status(201).json({ success: true, chapter: payload });
    } catch (err) {
      next(err);
    }
  }

  // Update chapter (bisa update title, order, dan/atau upload file baru)
  static async updateChapter(req, res, next) {
    try {
      const data = {};

      if (req.body.title !== undefined) {
        const t = (req.body.title || '').toString().trim();
        if (t) data.title = t;
      }

      if (req.body.order !== undefined) {
        data.order = parseInt(req.body.order, 10) || 0;
      }

      if (req.file) {
        data.contentPath = `${BASE_URL}/uploads/chapters/${req.file.filename}`;
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({ success: false, message: 'No update data provided' });
      }

      const chapter = await NovelService.updateChapter(req.params.novelId, req.params.chapterId, data);
      const payload = typeof formatChapter === 'function' ? formatChapter(chapter) : chapter;
      res.json({ success: true, chapter: payload });
    } catch (err) {
      next(err);
    }
  }

  // Hapus chapter
  static async deleteChapter(req, res, next) {
    try {
      await NovelService.deleteChapter(req.params.novelId, req.params.chapterId);
      res.json({ success: true, message: 'Chapter deleted' });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChapterController;

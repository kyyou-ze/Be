// Routes/chapter.routes.js  [#13]
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const ChapterController = require('../Controllers/ChapterController');
const auth = require('../Middleware/auth');
const role = require('../Middleware/role');

// Setup folder uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'chapters');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `novel-${req.params.novelId}-ch-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

router.get('/:novelId', ChapterController.getChapters);
router.get('/:novelId/:chapterId', ChapterController.getChapterById);

// Upload file docx/pdf sebagai chapter
router.post('/:novelId', auth, role(['author']), upload.single('file'), ChapterController.createChapter);

router.put('/:novelId/:chapterId', auth, role(['author']), upload.single('file'), ChapterController.updateChapter);
router.delete('/:novelId/:chapterId', auth, role(['author']), ChapterController.deleteChapter);

module.exports = router;

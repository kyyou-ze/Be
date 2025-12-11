// Routes/novel.routes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const NovelController = require('../Controllers/NovelController');
const auth = require('../Middleware/auth');
const role = require('../Middleware/role');

// Multer config untuk cover image lokal
const uploadDir = path.join(__dirname, '..', 'uploads', 'novels');
fs.mkdirSync(uploadDir, { recursive: true });

// Storage: gunakan filename unik (timestamp) untuk upload cover
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const name = `novel-${Date.now()}-${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, name);
  }
});

// Filter file: hanya gambar
const fileFilter = (_, file, cb) => {
  const ok = ['.png', '.jpg', '.jpeg', '.webp']
    .includes(path.extname(file.originalname).toLowerCase());
  cb(null, ok);
};

const upload = multer({ storage, fileFilter });

// Routes
router.get('/', NovelController.getAllNovels);
router.get('/:id', NovelController.getNovelById);

// Create novel (author only) — sekarang bisa langsung dengan cover
// gunakan field name "file" di input form
router.post(
  '/',
  auth,
  role(['author']),
  upload.single('file'),   // terima file cover langsung
  NovelController.createNovel
);

// Update novel (tanpa cover)
router.put('/:id', auth, role(['author']), upload.none(), NovelController.updateNovel);

// Delete novel
router.delete('/:id', auth, role(['author']), NovelController.deleteNovel);

// Upload cover image (author only) — endpoint khusus jika mau update cover saja
router.post(
  '/:id/cover',
  auth,
  role(['author']),
  upload.single('file'),
  NovelController.uploadCover
);

module.exports = router;

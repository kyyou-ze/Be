// Services/NovelService.js
const Novel = require('../Models/MongoDB/novel.model');

class NovelService {
  // ✅ Novel-level methods
  static async getAll() {
    return await Novel.find();
  }

  static async getById(id) {
    return await Novel.findById(id);
  }

  static async create(data, userId) {
    const novel = new Novel({
      ...data,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return await novel.save();
  }

  static async update(id, data) {
    return await Novel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  }

  static async remove(id) {
    return await Novel.findByIdAndDelete(id);
  }

  static async setCover(id, filePath) {
    return await Novel.findByIdAndUpdate(
      id,
      { cover: filePath, updatedAt: new Date() },
      { new: true }
    );
  }

  // ✅ Chapter-level methods (yang sudah kamu buat)
  static async getChapters(novelId) {
    const novel = await Novel.findById(novelId);
    return novel ? novel.chapters : [];
  }

  static async getChapterById(novelId, chapterId) {
    const novel = await Novel.findById(novelId);
    if (!novel) return null;
    return novel.chapters.id(chapterId);
  }

  static async createChapter(novelId, data) {
    const novel = await Novel.findById(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.chapters.push({
      title: data.title,
      contentPath: data.contentPath,
      order: data.order || novel.chapters.length,
      views: 0,
      updatedAt: new Date()
    });
    novel.updatedAt = new Date();
    await novel.save();
    return novel.chapters[novel.chapters.length - 1];
  }

  static async updateChapter(novelId, chapterId, data) {
    const novel = await Novel.findById(novelId);
    if (!novel) throw new Error('Novel not found');
    const chapter = novel.chapters.id(chapterId);
    if (!chapter) throw new Error('Chapter not found');
    if (data.title !== undefined) chapter.title = data.title;
    if (data.contentPath !== undefined) chapter.contentPath = data.contentPath;
    if (data.order !== undefined) chapter.order = data.order;
    chapter.updatedAt = new Date();
    novel.updatedAt = new Date();
    await novel.save();
    return chapter;
  }

  static async deleteChapter(novelId, chapterId) {
    const novel = await Novel.findById(novelId);
    if (!novel) throw new Error('Novel not found');
    const chapter = novel.chapters.id(chapterId);
    if (!chapter) throw new Error('Chapter not found');
    chapter.deleteOne();
    novel.updatedAt = new Date();
    await novel.save();
    return true;
  }
}

module.exports = NovelService;

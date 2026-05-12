import express from 'express';
import Notes from '../models/Notes.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { validateNotes } from '../middleware/validation.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — parse tags from either array or comma-string
// ─────────────────────────────────────────────────────────────────────────────
const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notes — Create a note
// ─────────────────────────────────────────────────────────────────────────────
router.post('/', verifyToken, validateNotes, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      subject,
      semester,
      branch,
      tags,
      category,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      isPublished,   // true = publish now, false = save as draft
    } = req.body;

    const note = new Notes({
      title:       title?.trim(),
      description: description?.trim() || '',
      content:     content?.trim()     || '',
      author:      req.userId,
      subject:     subject?.trim(),
      semester:    parseInt(semester)  || 1,
      branch:      branch?.trim()      || '',
      tags:        parseTags(tags),
      category:    category            || 'lecture',
      fileUrl:     fileUrl             || null,
      fileName:    fileName            || null,
      fileType:    fileType            || null,
      fileSize:    fileSize            || null,
      isPublished: isPublished !== false,   // default true unless explicitly false
    });

    await note.save();

    // Increment notesCount only for published notes
    if (note.isPublished) {
      await User.findByIdAndUpdate(req.userId, { $inc: { notesCount: 1 } });
    }

    await note.populate('author', 'username fullName avatar');

    res.status(201).json({
      message: note.isPublished ? 'Note published successfully' : 'Draft saved successfully',
      notes: note,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notes — Get all published notes (paginated)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = { isPublished: true, isFlagged: false };

    const [notes, total] = await Promise.all([
      Notes.find(filter)
        .populate('author', 'username fullName avatar college branch')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notes.countDocuments(filter),
    ]);

    res.json({
      notes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notes/subject/:subject — Notes by subject
// ─────────────────────────────────────────────────────────────────────────────
router.get('/subject/:subject', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = {
      subject: { $regex: req.params.subject, $options: 'i' },
      isPublished: true,
      isFlagged: false,
    };

    const [notes, total] = await Promise.all([
      Notes.find(filter)
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notes.countDocuments(filter),
    ]);

    res.json({
      notes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get notes by subject error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notes/user/:userId — Notes by user
// !! MUST be before /:id so Express doesn't treat "user" as an id !!
// ─────────────────────────────────────────────────────────────────────────────
router.get('/user/:userId', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const filter = { author: req.params.userId };

    const [notes, total] = await Promise.all([
      Notes.find(filter)
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notes.countDocuments(filter),
    ]);

    res.json({
      notes,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({ error: 'Failed to fetch user notes' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notes/:id — Get single note (increments views)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'username fullName avatar college branch email')
      .populate({ path: 'comments.user', select: 'username fullName avatar' });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/notes/:id — Update note
// ─────────────────────────────────────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const existing = await Notes.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    if (existing.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorised to edit this note' });
    }

    const {
      title, description, content,
      subject, semester, branch,
      tags, category, isPublished,
    } = req.body;

    // If promoting draft → published for first time, bump notesCount
    const wasPublished  = existing.isPublished;
    const willPublish   = isPublished !== undefined ? isPublished : existing.isPublished;
    if (!wasPublished && willPublish) {
      await User.findByIdAndUpdate(req.userId, { $inc: { notesCount: 1 } });
    }

    const updated = await Notes.findByIdAndUpdate(
      req.params.id,
      {
        title:       title?.trim()       ?? existing.title,
        description: description?.trim() ?? existing.description,
        content:     content?.trim()     ?? existing.content,
        subject:     subject?.trim()     ?? existing.subject,
        semester:    semester ? parseInt(semester) : existing.semester,
        branch:      branch?.trim()      ?? existing.branch,
        tags:        tags ? parseTags(tags) : existing.tags,
        category:    category            ?? existing.category,
        isPublished: willPublish,
        updatedAt:   Date.now(),
      },
      { new: true }
    ).populate('author', 'username fullName avatar');

    res.json({ message: 'Note updated successfully', notes: updated });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notes/:id — Delete note
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    if (note.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorised to delete this note' });
    }

    await Notes.findByIdAndDelete(req.params.id);

    if (note.isPublished) {
      await User.findByIdAndUpdate(req.userId, { $inc: { notesCount: -1 } });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notes/:id/like   — Like a note
// POST /api/notes/:id/unlike — Unlike a note
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.userId } },
      { new: true }
    ).populate('author', 'username fullName avatar');

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Liked successfully', notes: note, likesCount: note.likes.length });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like note' });
  }
});

router.post('/:id/unlike', verifyToken, async (req, res) => {
  try {
    const note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.userId } },
      { new: true }
    ).populate('author', 'username fullName avatar');

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Unliked successfully', notes: note, likesCount: note.likes.length });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Failed to unlike note' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notes/:id/comments — Add a comment
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const note = await Notes.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user:      req.userId,
            text:      text.trim(),
            createdAt: Date.now(),
          },
        },
      },
      { new: true }
    ).populate({ path: 'comments.user', select: 'username fullName avatar' });

    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json({ message: 'Comment added successfully', comments: note.comments });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notes/:id/download — Record a download
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/download', verifyToken, async (req, res) => {
  try {
    await Notes.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.json({ message: 'Download recorded' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

export default router;
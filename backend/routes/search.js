import express from 'express';
import Notes from '../models/Notes.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

const router = express.Router();

// Global search
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const skip = (page - 1) * limit;
    const searchRegex = { $regex: q, $options: 'i' };

    let results = {};

    if (type === 'all' || type === 'notes') {
      const notes = await Notes.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { subject: searchRegex },
          { tags: searchRegex }
        ],
        isPublished: true,
        isFlagged: false
      })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const notesTotal = await Notes.countDocuments({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { subject: searchRegex },
          { tags: searchRegex }
        ],
        isPublished: true,
        isFlagged: false
      });

      results.notes = {
        data: notes,
        total: notesTotal,
        pages: Math.ceil(notesTotal / limit)
      };
    }

    if (type === 'all' || type === 'users') {
      const users = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
          { college: searchRegex },
          { branch: searchRegex }
        ]
      })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const usersTotal = await User.countDocuments({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
          { college: searchRegex },
          { branch: searchRegex }
        ]
      });

      results.users = {
        data: users,
        total: usersTotal,
        pages: Math.ceil(usersTotal / limit)
      };
    }

    if (type === 'all' || type === 'groups') {
      const groups = await Group.find({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { subject: searchRegex }
        ],
        isPublic: true
      })
        .populate('creator', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const groupsTotal = await Group.countDocuments({
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { subject: searchRegex }
        ],
        isPublic: true
      });

      results.groups = {
        data: groups,
        total: groupsTotal,
        pages: Math.ceil(groupsTotal / limit)
      };
    }

    res.json({
      query: q,
      results,
      page,
      limit
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Search notes by filters
router.get('/notes/advanced', async (req, res) => {
  try {
    const { subject, semester, branch, category, tags, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      isPublished: true,
      isFlagged: false
    };

    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (semester) filter.semester = parseInt(semester);
    if (branch) filter.branch = { $regex: branch, $options: 'i' };
    if (category) filter.category = category;
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      filter.tags = { $in: tagArray };
    }

    const notes = await Notes.find(filter)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notes.countDocuments(filter);

    res.json({
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Advanced search failed' });
  }
});

// Trending notes
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const trendingNotes = await Notes.find({ isPublished: true, isFlagged: false })
      .populate('author', 'username fullName avatar')
      .sort({ likes: -1, downloads: -1, views: -1 })
      .limit(limit);

    res.json({ trendingNotes });
  } catch (error) {
    console.error('Trending search error:', error);
    res.status(500).json({ error: 'Failed to fetch trending notes' });
  }
});

// Top authors
router.get('/top-authors', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const topAuthors = await User.find()
      .select('-password')
      .sort({ notesCount: -1 })
      .limit(limit);

    res.json({ topAuthors });
  } catch (error) {
    console.error('Top authors search error:', error);
    res.status(500).json({ error: 'Failed to fetch top authors' });
  }
});

// Popular subjects
router.get('/popular-subjects', async (req, res) => {
  try {
    const subjects = await Notes.aggregate([
      { $match: { isPublished: true, isFlagged: false } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({ subjects });
  } catch (error) {
    console.error('Popular subjects search error:', error);
    res.status(500).json({ error: 'Failed to fetch popular subjects' });
  }
});

export default router;

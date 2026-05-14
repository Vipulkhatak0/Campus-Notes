import express from 'express';
import User from '../models/User.js';
import Notes from '../models/Notes.js';
import Group from '../models/Group.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Notes.countDocuments();
    const totalGroups = await Group.countDocuments();
    const flaggedNotes = await Notes.countDocuments({ isFlagged: true });

    const usersGrowth = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    const notesGrowth = await Notes.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.json({
      totalUsers,
      totalNotes,
      totalGroups,
      flaggedNotes,
      usersGrowth,
      notesGrowth
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});


router.put('/users/:id/role', verifyToken, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

router.put('/users/:id/ban', verifyToken, isAdmin, async (req, res) => {
  try {
    const { isBanned } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: !isBanned, updatedAt: Date.now() },
      { new: true }
    ).select('-password');

    res.json({
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
});


router.get('/notes/flagged', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const flaggedNotes = await Notes.find({ isFlagged: true })
      .populate('author', 'username fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notes.countDocuments({ isFlagged: true });

    res.json({
      notes: flaggedNotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get flagged notes error:', error);
    res.status(500).json({ error: 'Failed to fetch flagged notes' });
  }
});


router.post('/notes/:id/flag', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const notes = await Notes.findByIdAndUpdate(
      req.params.id,
      {
        isFlagged: true,
        flagReason: reason || 'User reported',
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      message: 'Notes flagged successfully',
      notes
    });
  } catch (error) {
    console.error('Flag notes error:', error);
    res.status(500).json({ error: 'Failed to flag notes' });
  }
});

router.put('/notes/:id/moderation', verifyToken, isAdmin, async (req, res) => {
  try {
    const { action } = req.body;

    if (action === 'approve') {
      const notes = await Notes.findByIdAndUpdate(
        req.params.id,
        { isFlagged: false, flagReason: '', updatedAt: Date.now() },
        { new: true }
      );

      return res.json({
        message: 'Notes approved successfully',
        notes
      });
    } else if (action === 'reject') {
      await Notes.findByIdAndUpdate(
        req.params.id,
        { isPublished: false, updatedAt: Date.now() }
      );

      return res.json({
        message: 'Notes rejected and unpublished'
      });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ error: 'Failed to process moderation' });
  }
});

router.delete('/notes/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const notes = await Notes.findByIdAndDelete(req.params.id);

    if (notes) {
      await User.findByIdAndUpdate(notes.author, { $inc: { notesCount: -1 } });
    }

    res.json({ message: 'Notes deleted successfully' });
  } catch (error) {
    console.error('Delete notes error:', error);
    res.status(500).json({ error: 'Failed to delete notes' });
  }
});


router.delete('/groups/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});


router.get('/notes', verifyToken, isAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Notes.find()
      .populate('author', 'username fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notes.countDocuments();

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
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

export default router;


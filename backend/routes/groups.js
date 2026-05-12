import express from 'express';
import Group from '../models/Group.js';
import Notes from '../models/Notes.js';
import { verifyToken } from '../middleware/auth.js';
import { validateGroup } from '../middleware/validation.js';

const router = express.Router();

// Create group
router.post('/', verifyToken, validateGroup, async (req, res) => {
  try {
    const { name, description, college, branch, semester, subject, isPublic } = req.body;

    const group = new Group({
      name,
      description,
      creator: req.userId,
      college,
      branch,
      semester: semester || [],
      subject,
      isPublic: isPublic !== false,
      members: [req.userId],
      membersCount: 1
    });

    await group.save();
    await group.populate('creator', 'username fullName avatar');

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get all groups with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const groups = await Group.find({ isPublic: true })
      .populate('creator', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Group.countDocuments({ isPublic: true });

    res.json({
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group by ID
router.get('/:id', async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'username fullName avatar email')
      .populate('members', 'username fullName avatar college branch');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Update group
router.put('/:id', verifyToken, async (req, res) => {
  try {
    let group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this group' });
    }

    const { name, description, college, branch, semester, subject, isPublic } = req.body;

    group = await Group.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        college,
        branch,
        semester,
        subject,
        isPublic,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('creator', 'username fullName avatar');

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this group' });
    }

    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Join group
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { members: req.userId },
        $inc: { membersCount: 1 }
      },
      { new: true }
    ).populate('creator', 'username fullName avatar');

    res.json({
      message: 'Joined group successfully',
      group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/:id/leave', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (group.creator.toString() === req.userId) {
      return res.status(400).json({ error: 'Creator cannot leave the group' });
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { members: req.userId },
        $inc: { membersCount: -1 }
      },
      { new: true }
    ).populate('creator', 'username fullName avatar');

    res.json({
      message: 'Left group successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group notes
router.get('/:id/notes', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const notes = await Notes.find({ group: req.params.id, isPublished: true })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notes.countDocuments({ group: req.params.id, isPublished: true });

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
    console.error('Get group notes error:', error);
    res.status(500).json({ error: 'Failed to fetch group notes' });
  }
});

// Add notes to group
router.post('/:groupId/notes/:noteId', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    await Notes.findByIdAndUpdate(
      req.params.noteId,
      { group: req.params.groupId }
    );

    res.json({ message: 'Note added to group successfully' });
  } catch (error) {
    console.error('Add note to group error:', error);
    res.status(500).json({ error: 'Failed to add note to group' });
  }
});

// Get user groups
router.get('/user/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const groups = await Group.find({ members: req.params.userId })
      .populate('creator', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Group.countDocuments({ members: req.params.userId });

    res.json({
      groups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user groups error:', error);
    res.status(500).json({ error: 'Failed to fetch user groups' });
  }
});

export default router;

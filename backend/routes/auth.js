import express from 'express';
import User from '../models/User.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Signup endpoint
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { username, email, password, fullName, college, branch, semester } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      fullName,
      college,
      branch,
      semester
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, bio, college, branch, semester, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        fullName,
        bio,
        college,
        branch,
        semester,
        avatar,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Follow user
router.post('/follow/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userToFollowId = req.params.id;

    if (userId === userToFollowId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { following: userToFollowId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userToFollowId,
      { $addToSet: { followers: userId } }
    );

    res.json({ message: 'Followed successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow user
router.post('/unfollow/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userToUnfollowId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { following: userToUnfollowId } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      userToUnfollowId,
      { $pull: { followers: userId } }
    );

    res.json({ message: 'Unfollowed successfully', user: user.toJSON() });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

export default router;

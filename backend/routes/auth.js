
import express from 'express';
import bcryptjs from 'bcryptjs';
import supabase from '../../lib/supabase.js';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { validateSignup, validateLogin } from '../middleware/validation.js';

const router = express.Router();


const formatUser = (u) => ({
  id:          u.id,
  username:    u.username,
  email:       u.email,
  fullName:    u.full_name,
  college:     u.college,
  branch:      u.branch,
  semester:    u.semester,
  avatar:      u.avatar,
  bio:         u.bio,
  role:        u.role,
  isVerified:  u.is_verified,
  notesCount:  u.notes_count,
  createdAt:   u.created_at,
  updatedAt:   u.updated_at,
});

router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { username, email, password, fullName, college, branch, semester } = req.body;

   
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

   
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        username,
        email:     email.toLowerCase(),
        password:  hashedPassword,
        full_name: fullName  || '',
        college:   college   || '',
        branch:    branch    || '',
        semester:  semester  || 1,
      })
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcryptjs.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    res.json(formatUser(user));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { fullName, bio, college, branch, semester, avatar } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name:  fullName,
        bio,
        college,
        branch,
        semester,
        avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully', user: formatUser(user) });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


router.get('/user/:id', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const [{ data: followerRows }, { data: followingRows }] = await Promise.all([
      supabase.from('followers').select('follower_id, users!followers_follower_id_fkey(id, username, full_name, avatar)').eq('following_id', req.params.id),
      supabase.from('followers').select('following_id, users!followers_following_id_fkey(id, username, full_name, avatar)').eq('follower_id', req.params.id),
    ]);

    const followers = (followerRows || []).map(r => r.users);
    const following = (followingRows || []).map(r => r.users);

    res.json({ ...formatUser(user), followers, following });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

router.post('/follow/:id', verifyToken, async (req, res) => {
  try {
    const userId          = req.userId;
    const userToFollowId  = req.params.id;

    if (userId === userToFollowId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const { error } = await supabase
      .from('followers')
      .upsert({ follower_id: userId, following_id: userToFollowId });

    if (error) throw error;

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

router.post('/unfollow/:id', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', req.userId)
      .eq('following_id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

export default router;

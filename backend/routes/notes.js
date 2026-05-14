
import express from 'express';
import supabase from '../../lib/supabase.js'
import { verifyToken } from '../middleware/auth.js';
import { validateNotes } from '../middleware/validation.js';

const router = express.Router();

const parseTags = (tags) => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
  return String(tags).split(',').map(t => t.trim()).filter(Boolean);
};

const getNoteWithRelations = async (noteId) => {
  const [{ data: note }, { count: likesCount }, { data: comments }] = await Promise.all([
    supabase
      .from('notes')
      .select(`
        *,
        author:users!notes_author_id_fkey (
          id, username, full_name, avatar, college, branch, email
        )
      `)
      .eq('id', noteId)
      .maybeSingle(),

    supabase
      .from('note_likes')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', noteId),

    supabase
      .from('comments')
      .select(`
        *,
        user:users!comments_user_id_fkey (id, username, full_name, avatar)
      `)
      .eq('note_id', noteId)
      .order('created_at', { ascending: true }),
  ]);

  if (!note) return null;
  return { ...note, likesCount: likesCount || 0, comments: comments || [] };
};


router.post('/', verifyToken, validateNotes, async (req, res) => {
  try {
    const {
      title, description, content, subject, semester, branch,
      tags, category, fileUrl, fileName, fileType, fileSize, isPublished,
    } = req.body;

    const publish = isPublished !== false;

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        title:       title?.trim(),
        description: description?.trim() || '',
        content:     content?.trim()     || '',
        author_id:   req.userId,
        subject:     subject?.trim(),
        semester:    parseInt(semester)  || 1,
        branch:      branch?.trim()      || '',
        tags:        parseTags(tags),
        category:    category            || 'lecture',
        file_url:    fileUrl             || null,
        file_name:   fileName            || null,
        file_type:   fileType            || null,
        file_size:   fileSize            || null,
        is_published: publish,
      })
      .select()
      .single();

    if (error) throw error;

    if (publish) {
      await supabase.rpc('increment_notes_count', { user_id: req.userId, delta: 1 });
    }

    const full = await getNoteWithRelations(note.id);

    res.status(201).json({
      message: publish ? 'Note published successfully' : 'Draft saved successfully',
      notes: full,
    });
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.get('/', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data: notes, error, count } = await supabase
      .from('notes')
      .select(`
        *,
        author:users!notes_author_id_fkey (id, username, full_name, avatar, college, branch)
      `, { count: 'exact' })
      .eq('is_published', true)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

   
    const noteIds = notes.map(n => n.id);
    const { data: likesRows } = await supabase
      .from('note_likes')
      .select('note_id')
      .in('note_id', noteIds);

    const likesByNote = {};
    (likesRows || []).forEach(r => {
      likesByNote[r.note_id] = (likesByNote[r.note_id] || 0) + 1;
    });

    const enriched = notes.map(n => ({ ...n, likesCount: likesByNote[n.id] || 0 }));

    res.json({
      notes: enriched,
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.get('/subject/:subject', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data: notes, error, count } = await supabase
      .from('notes')
      .select(`
        *,
        author:users!notes_author_id_fkey (id, username, full_name, avatar)
      `, { count: 'exact' })
      .ilike('subject', `%${req.params.subject}%`)
      .eq('is_published', true)
      .eq('is_flagged', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      notes: notes || [],
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get notes by subject error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const from  = (page - 1) * limit;
    const to    = from + limit - 1;

    const { data: notes, error, count } = await supabase
      .from('notes')
      .select(`
        *,
        author:users!notes_author_id_fkey (id, username, full_name, avatar)
      `, { count: 'exact' })
      .eq('author_id', req.params.userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      notes: notes || [],
      pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error('Get user notes error:', error);
    res.status(500).json({ error: 'Failed to fetch user notes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await supabase.rpc('increment_views', { note_id: req.params.id });

    const note = await getNoteWithRelations(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError || !existing) return res.status(404).json({ error: 'Note not found' });
    if (existing.author_id !== req.userId) return res.status(403).json({ error: 'Not authorised to edit this note' });

    const {
      title, description, content, subject,
      semester, branch, tags, category, isPublished,
    } = req.body;

    const willPublish = isPublished !== undefined ? isPublished : existing.is_published;

    if (!existing.is_published && willPublish) {
      await supabase.rpc('increment_notes_count', { user_id: req.userId, delta: 1 });
    }

    const { error: updateError } = await supabase
      .from('notes')
      .update({
        title:        title?.trim()       ?? existing.title,
        description:  description?.trim() ?? existing.description,
        content:      content?.trim()     ?? existing.content,
        subject:      subject?.trim()     ?? existing.subject,
        semester:     semester ? parseInt(semester) : existing.semester,
        branch:       branch?.trim()      ?? existing.branch,
        tags:         tags ? parseTags(tags) : existing.tags,
        category:     category            ?? existing.category,
        is_published: willPublish,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', req.params.id);

    if (updateError) throw updateError;

    const updated = await getNoteWithRelations(req.params.id);
    res.json({ message: 'Note updated successfully', notes: updated });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});


router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchError || !note) return res.status(404).json({ error: 'Note not found' });
    if (note.author_id !== req.userId) return res.status(403).json({ error: 'Not authorised to delete this note' });

    const { error } = await supabase.from('notes').delete().eq('id', req.params.id);
    if (error) throw error;

    if (note.is_published) {
      await supabase.rpc('increment_notes_count', { user_id: req.userId, delta: -1 });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('note_likes')
      .upsert({ note_id: req.params.id, user_id: req.userId });

    if (error) throw error;

    const { count } = await supabase
      .from('note_likes')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', req.params.id);

    res.json({ message: 'Liked successfully', likesCount: count || 0 });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like note' });
  }
});

router.post('/:id/unlike', verifyToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('note_likes')
      .delete()
      .eq('note_id', req.params.id)
      .eq('user_id', req.userId);

    if (error) throw error;

    const { count } = await supabase
      .from('note_likes')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', req.params.id);

    res.json({ message: 'Unliked successfully', likesCount: count || 0 });
  } catch (error) {
    console.error('Unlike error:', error);
    res.status(500).json({ error: 'Failed to unlike note' });
  }
});

router.post('/:id/comments', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text is required' });

    const { error } = await supabase
      .from('comments')
      .insert({ note_id: req.params.id, user_id: req.userId, text: text.trim() });

    if (error) throw error;

    const { data: comments } = await supabase
      .from('comments')
      .select(`*, user:users!comments_user_id_fkey (id, username, full_name, avatar)`)
      .eq('note_id', req.params.id)
      .order('created_at', { ascending: true });

    res.json({ message: 'Comment added successfully', comments: comments || [] });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

router.post('/:id/download', verifyToken, async (req, res) => {
  try {
    await supabase.rpc('increment_downloads', { note_id: req.params.id });
    res.json({ message: 'Download recorded' });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to record download' });
  }
});

export default router;
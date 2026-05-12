import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const notesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  semester: {
    type: Number,
    min: 1,
    max: 8,
    default: 1,
  },
  branch: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: ['lecture', 'lab', 'assignment', 'previous-year-paper', 'other'],
    default: 'lecture',
  },
  tags: [{
    type: String,
    trim: true,
  }],

  // File upload fields
  fileUrl: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    default: null,
  },
  fileSize: {
    type: Number,
    default: null,
  },

  // Engagement
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0,
  },
  downloads: {
    type: Number,
    default: 0,
  },

  // Status
  isPublished: {
    type: Boolean,
    default: true,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
    default: null,
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

// Indexes for faster querying
notesSchema.index({ author: 1 });
notesSchema.index({ subject: 1 });
notesSchema.index({ isPublished: 1, isFlagged: 1 });
notesSchema.index({ createdAt: -1 });
notesSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });

const Notes = mongoose.model('Notes', notesSchema);

export default Notes;
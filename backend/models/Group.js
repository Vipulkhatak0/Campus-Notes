import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/100'
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  college: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: ''
  },
  semester: [{
    type: Number
  }],
  subject: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  notesCount: {
    type: Number,
    default: 0
  },
  membersCount: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Group', groupSchema);

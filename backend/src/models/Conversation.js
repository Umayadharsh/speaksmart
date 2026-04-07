const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['CALL', 'INTERVIEW', 'CHALLENGE', 'FREE_TALK'],
    default: 'FREE_TALK'
  },
  title: {
    type: String,
    default: 'English Practice Session'
  },
  languageMode: {
    type: String,
    enum: ['ENGLISH', 'TAMIL_ASSISTED'],
    default: 'ENGLISH'
  },
  languagesUsed: {
    type: [String],
    default: ['ENGLISH']
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  durationSeconds: {
    type: Number,
    default: 0
  },
  overallScore: {
    type: Number,
    default: 0
  },
  feedback: {
    grammar: [String],
    vocabulary: [String],
    pronunciation: [String],
    summary: String
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'ABANDONED'],
    default: 'ACTIVE'
  },
  metadata: {
    jobRole: String,       // for INTERVIEW sessions
    challengeTopic: String, // for CHALLENGE sessions
    difficulty: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conversation', conversationSchema);

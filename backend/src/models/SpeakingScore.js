const mongoose = require('mongoose');

const speakingScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sessionType: {
    type: String,
    enum: ['CALL', 'INTERVIEW', 'CHALLENGE', 'FREE_TALK'],
    required: true
  },
  topic: { type: String, default: 'General' },
  languageMode: {
    type: String,
    enum: ['ENGLISH', 'TAMIL_ASSISTED'],
    default: 'ENGLISH'
  },
  scores: {
    fluency: { type: Number, min: 0, max: 100, default: 0 },
    vocabulary: { type: Number, min: 0, max: 100, default: 0 },
    grammar: { type: Number, min: 0, max: 100, default: 0 },
    pronunciation: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    overall: { type: Number, min: 0, max: 100, default: 0 }
  },
  xpEarned: { type: Number, default: 0 },
  wordsSpoken: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 0 },
  corrections: [{ original: String, corrected: String }],
  vocabularyLearned: [{ word: String, meaning: String }]
}, {
  timestamps: true
});

// Index for leaderboard queries
speakingScoreSchema.index({ 'scores.overall': -1 });
speakingScoreSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SpeakingScore', speakingScoreSchema);

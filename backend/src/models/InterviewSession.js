const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  jobRole: {
    type: String,
    required: true,
    trim: true
  },
  languageMode: {
    type: String,
    enum: ['ENGLISH', 'TAMIL_ASSISTED'],
    default: 'ENGLISH'
  },
  status: {
    type: String,
    enum: ['IN_PROGRESS', 'COMPLETED'],
    default: 'IN_PROGRESS'
  },
  questions: [{
    question: String,
    questionTamil: String,
    category: {
      type: String,
      enum: ['INTRODUCTION', 'TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'CLOSING']
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD']
    },
    askedAt: Date
  }],
  answers: [{
    questionIndex: Number,
    userAnswer: String,
    betterAnswer: String,
    betterAnswerTamil: String,
    grammarCorrections: [{
      original: String,
      corrected: String,
      explanation: String
    }],
    confidenceScore: { type: Number, min: 0, max: 100 },
    fluencyScore: { type: Number, min: 0, max: 100 },
    contentScore: { type: Number, min: 0, max: 100 },
    overallScore: { type: Number, min: 0, max: 100 },
    answeredAt: Date
  }],
  overallScore: { type: Number, default: 0 },
  finalFeedback: {
    strengths: [String],
    improvements: [String],
    summary: String,
    summaryTamil: String
  },
  durationSeconds: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['ENGLISH', 'TAMIL', 'TANGLISH'],
    default: 'ENGLISH'
  },
  audioTranscript: {
    type: String,
    default: ''
  },
  corrections: [{
    original: String,
    corrected: String,
    explanation: String,
    explanationTamil: String
  }],
  vocabulary: [{
    word: String,
    meaning: String,
    meaningTamil: String,
    example: String
  }],
  pronunciationTips: [String],
  sentiment: {
    type: String,
    enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'CONFUSED'],
    default: 'NEUTRAL'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);

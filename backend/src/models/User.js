const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  languageMode: {
    type: String,
    enum: ['ENGLISH', 'TAMIL_ASSISTED'],
    default: 'ENGLISH'
  },
  tamilAssistLevel: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BEGINNER'
  },
  speakingStats: {
    totalSessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    fluencyScore: { type: Number, default: 0 },
    vocabularyScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    grammarScore: { type: Number, default: 0 }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Fluent'],
    default: 'Beginner'
  },
  xp: { type: Number, default: 0 },
  personalityMode: {
    type: String,
    enum: ['FRIENDLY', 'PROFESSIONAL', 'STRICT_COACH', 'CASUAL'],
    default: 'FRIENDLY'
  },
  avatar: { type: String, default: '' },
  conversationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  }],
  badges: [{
    name: String,
    icon: String,
    earnedAt: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update streak on login
userSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!this.streak.lastActiveDate) {
    this.streak.current = 1;
  } else {
    const last = new Date(this.streak.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      this.streak.current += 1;
    } else if (diffDays > 1) {
      this.streak.current = 1;
    }
  }
  
  if (this.streak.current > this.streak.longest) {
    this.streak.longest = this.streak.current;
  }
  
  this.streak.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema);

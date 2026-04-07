const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password, languageMode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      languageMode: languageMode || 'ENGLISH',
    });

    user.updateStreak();
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to SpeakSmart 🎉',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        languageMode: user.languageMode,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        speakingStats: user.speakingStats,
        personalityMode: user.personalityMode,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.updateStreak();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 🌟`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        languageMode: user.languageMode,
        tamilAssistLevel: user.tamilAssistLevel,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        speakingStats: user.speakingStats,
        personalityMode: user.personalityMode,
        badges: user.badges,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('conversationHistory', 'title sessionType createdAt overallScore status');

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        languageMode: user.languageMode,
        tamilAssistLevel: user.tamilAssistLevel,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        speakingStats: user.speakingStats,
        personalityMode: user.personalityMode,
        badges: user.badges,
        conversationHistory: user.conversationHistory,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
};

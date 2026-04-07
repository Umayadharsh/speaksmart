const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const SpeakingScore = require('../models/SpeakingScore');
const aiService = require('../services/aiService');

// @desc    Start a new conversation session
// @route   POST /api/conversation/start
// @access  Private
exports.startConversation = async (req, res, next) => {
  try {
    const { sessionType = 'FREE_TALK', title } = req.body;
    const user = req.user;

    const conversation = await Conversation.create({
      userId: user._id,
      sessionType,
      title: title || `${sessionType.replace('_', ' ')} Session`,
      languageMode: user.languageMode,
    });

    // Add to user's history
    await User.findByIdAndUpdate(user._id, {
      $push: { conversationHistory: conversation._id },
      $inc: { 'speakingStats.totalSessions': 1 }
    });

    // Send welcome message from AI
    const welcomeResponse = aiService.generateConversationResponse(
      'hello',
      [],
      user.languageMode,
      user.tamilAssistLevel
    );

    const aiMessage = await Message.create({
      conversationId: conversation._id,
      role: 'assistant',
      content: welcomeResponse.message,
      language: welcomeResponse.language,
    });

    await Conversation.findByIdAndUpdate(conversation._id, {
      $push: { messages: aiMessage._id }
    });

    res.status(201).json({
      success: true,
      conversation: {
        id: conversation._id,
        sessionType,
        languageMode: user.languageMode,
      },
      welcomeMessage: {
        id: aiMessage._id,
        role: 'assistant',
        content: welcomeResponse.message,
        language: welcomeResponse.language,
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/conversation/message
// @access  Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    const user = req.user;

    if (!conversationId || !message) {
      return res.status(400).json({ success: false, message: 'conversationId and message are required' });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId: user._id })
      .populate('messages', 'role content language');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId,
      role: 'user',
      content: message,
      language: aiService.detectLanguage(message),
    });

    // Build conversation history for context
    const history = conversation.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Generate AI response
    const aiResponse = aiService.generateConversationResponse(
      message,
      history,
      user.languageMode,
      user.tamilAssistLevel
    );

    // Save AI message with feedback
    const aiMessage = await Message.create({
      conversationId,
      role: 'assistant',
      content: aiResponse.message,
      language: aiResponse.language,
      corrections: aiResponse.feedback.corrections,
      vocabulary: aiResponse.feedback.vocabulary,
      pronunciationTips: aiResponse.feedback.pronunciationTips,
    });

    // Add both messages to conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $push: { messages: { $each: [userMessage._id, aiMessage._id] } }
    });

    // Save speaking score
    const scoreData = aiResponse.scores;
    await SpeakingScore.create({
      userId: user._id,
      sessionType: conversation.sessionType,
      topic: 'General Conversation',
      languageMode: user.languageMode,
      scores: {
        fluency: scoreData.fluency,
        vocabulary: scoreData.vocabulary,
        grammar: scoreData.grammar,
        confidence: scoreData.confidence,
        pronunciation: scoreData.pronunciation,
        overall: scoreData.overall,
      },
      xpEarned: scoreData.xpEarned,
      wordsSpoken: scoreData.wordsSpoken,
    });

    // Update user stats
    const updateOps = {
      $inc: {
        xp: scoreData.xpEarned,
        'speakingStats.totalMinutes': Math.ceil(scoreData.wordsSpoken / 130),
      }
    };

    // Update averages
    const currentUser = await User.findById(user._id);
    const prevAvg = currentUser.speakingStats.averageScore || 0;
    const sessions = currentUser.speakingStats.totalSessions || 1;
    updateOps.$set = {
      'speakingStats.averageScore': Math.round(((prevAvg * (sessions - 1)) + scoreData.overall) / sessions),
      'speakingStats.fluencyScore': scoreData.fluency,
      'speakingStats.vocabularyScore': scoreData.vocabulary,
      'speakingStats.confidenceScore': scoreData.confidence,
      'speakingStats.grammarScore': scoreData.grammar,
    };

    await User.findByIdAndUpdate(user._id, updateOps);

    res.json({
      success: true,
      userMessage: { id: userMessage._id, role: 'user', content: message, language: userMessage.language },
      aiMessage: { id: aiMessage._id, role: 'assistant', content: aiResponse.message, language: aiResponse.language },
      feedback: aiResponse.feedback,
      scores: aiResponse.scores,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get conversation history
// @route   GET /api/conversation/history
// @access  Private
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const conversations = await Conversation.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('messages', 'role content language createdAt')
      .select('-__v');

    const total = await Conversation.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      conversations,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    End a conversation
// @route   PUT /api/conversation/:id/end
// @access  Private
exports.endConversation = async (req, res, next) => {
  try {
    const { durationSeconds } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { status: 'COMPLETED', durationSeconds: durationSeconds || 0 },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, message: 'Session saved successfully!', conversation });
  } catch (err) {
    next(err);
  }
};

// @desc    Get challenge topics
// @route   GET /api/conversation/challenges
// @access  Private
exports.getChallenges = async (req, res, next) => {
  try {
    res.json({
      success: true,
      challenges: aiService.CHALLENGE_TOPICS
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit challenge response
// @route   POST /api/conversation/challenge/submit
// @access  Private
exports.submitChallenge = async (req, res, next) => {
  try {
    const { topic, response, topicId, durationSeconds } = req.body;
    const user = req.user;

    const evaluation = aiService.evaluateChallenge(topic, response, user.languageMode);

    // Save score
    await SpeakingScore.create({
      userId: user._id,
      sessionType: 'CHALLENGE',
      topic,
      languageMode: user.languageMode,
      scores: {
        fluency: evaluation.scores.fluency,
        vocabulary: evaluation.scores.vocabulary,
        grammar: evaluation.scores.grammar,
        confidence: evaluation.scores.confidence,
        pronunciation: evaluation.scores.pronunciation,
        overall: evaluation.scores.overall,
      },
      xpEarned: evaluation.scores.xpEarned,
      wordsSpoken: evaluation.scores.wordsSpoken,
      durationSeconds: durationSeconds || 0,
    });

    // Update user XP
    await User.findByIdAndUpdate(user._id, {
      $inc: { xp: evaluation.scores.xpEarned }
    });

    res.json({
      success: true,
      evaluation,
    });
  } catch (err) {
    next(err);
  }
};

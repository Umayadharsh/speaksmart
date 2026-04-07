const User = require('../models/User');
const SpeakingScore = require('../models/SpeakingScore');
const Conversation = require('../models/Conversation');
const InterviewSession = require('../models/InterviewSession');

// @desc    Get user stats and analytics
// @route   GET /api/user/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get user
    const user = await User.findById(userId).select('-password');

    // Get recent scores (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentScores = await SpeakingScore.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    // Get all scores for chart (last 14 data points)
    const allScores = await SpeakingScore.find({ userId })
      .sort({ createdAt: -1 })
      .limit(14)
      .select('scores sessionType topic createdAt');

    // Leaderboard: top 10 users by XP
    const leaderboard = await User.find({})
      .sort({ xp: -1 })
      .limit(10)
      .select('name xp level streak');

    // Add rank to current user
    const userRank = await User.countDocuments({ xp: { $gt: user.xp } }) + 1;

    // Interview stats
    const interviewCount = await InterviewSession.countDocuments({ userId, status: 'COMPLETED' });
    const interviewScores = await InterviewSession.find({ userId, status: 'COMPLETED' })
      .select('overallScore jobRole createdAt');

    // Conversation stats by type
    const sessionBreakdown = await Conversation.aggregate([
      { $match: { userId } },
      { $group: { _id: '$sessionType', count: { $sum: 1 } } }
    ]);

    // Chart data: scores over time
    const chartData = allScores.reverse().map((s, i) => ({
      session: i + 1,
      date: new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      overall: s.scores.overall,
      fluency: s.scores.fluency,
      grammar: s.scores.grammar,
      vocabulary: s.scores.vocabulary,
      confidence: s.scores.confidence,
      topic: s.topic,
      type: s.sessionType,
    }));

    // Activity heatmap: last 7 days
    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await SpeakingScore.countDocuments({
        userId,
        createdAt: { $gte: date, $lt: nextDate }
      });

      activityData.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
        sessions: count,
      });
    }

    res.json({
      success: true,
      stats: {
        user: {
          name: user.name,
          email: user.email,
          level: user.level,
          xp: user.xp,
          languageMode: user.languageMode,
          streak: user.streak,
          badges: user.badges,
          speakingStats: user.speakingStats,
          rank: userRank,
        },
        chartData,
        activityData,
        sessionBreakdown: sessionBreakdown.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        interviewStats: {
          total: interviewCount,
          scores: interviewScores.slice(0, 5),
        },
        leaderboard: leaderboard.map((u, i) => ({
          rank: i + 1,
          name: u.name,
          xp: u.xp,
          level: u.level,
          streak: u.streak.current,
          isCurrentUser: u._id.toString() === userId.toString(),
        })),
        totalScores: await SpeakingScore.countDocuments({ userId }),
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update language mode
// @route   POST /api/user/language-mode
// @access  Private
exports.updateLanguageMode = async (req, res, next) => {
  try {
    const { languageMode, tamilAssistLevel } = req.body;

    if (!['ENGLISH', 'TAMIL_ASSISTED'].includes(languageMode)) {
      return res.status(400).json({ success: false, message: 'Invalid language mode' });
    }

    const updateData = { languageMode };
    if (tamilAssistLevel && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(tamilAssistLevel)) {
      updateData.tamilAssistLevel = tamilAssistLevel;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true })
      .select('-password');

    res.json({
      success: true,
      message: languageMode === 'TAMIL_ASSISTED'
        ? 'Tamil-Assisted mode activated! Neenga English English கற்க ready! 🌟'
        : 'English mode activated! Let\'s speak in full English! 💪',
      user: { languageMode: user.languageMode, tamilAssistLevel: user.tamilAssistLevel }
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Update personality mode
// @route  POST /api/user/personality
// @access Private
exports.updatePersonality = async (req, res, next) => {
  try {
    const { personalityMode } = req.body;

    if (!['FRIENDLY', 'PROFESSIONAL', 'STRICT_COACH', 'CASUAL'].includes(personalityMode)) {
      return res.status(400).json({ success: false, message: 'Invalid personality mode' });
    }

    await User.findByIdAndUpdate(req.user._id, { personalityMode });

    res.json({ success: true, message: 'AI personality updated!', personalityMode });
  } catch (err) {
    next(err);
  }
};

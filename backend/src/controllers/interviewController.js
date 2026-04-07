const InterviewSession = require('../models/InterviewSession');
const SpeakingScore = require('../models/SpeakingScore');
const User = require('../models/User');
const aiService = require('../services/aiService');

// @desc    Start interview session
// @route   POST /api/interview/start
// @access  Private
exports.startInterview = async (req, res, next) => {
  try {
    const { jobRole } = req.body;
    const user = req.user;

    if (!jobRole) {
      return res.status(400).json({ success: false, message: 'Job role is required' });
    }

    const questions = aiService.getInterviewQuestions(jobRole);

    const session = await InterviewSession.create({
      userId: user._id,
      jobRole,
      languageMode: user.languageMode,
      questions: questions.map(q => ({
        ...q,
        askedAt: new Date()
      })),
    });

    res.status(201).json({
      success: true,
      sessionId: session._id,
      jobRole,
      questions: questions.map((q, i) => ({
        index: i,
        question: q.question,
        questionTamil: user.languageMode === 'TAMIL_ASSISTED' ? q.questionTamil : null,
        category: q.category,
        difficulty: q.difficulty,
      })),
      totalQuestions: questions.length,
      message: user.languageMode === 'TAMIL_ASSISTED'
        ? `Interview started! Neenga ${jobRole} position ku prepare aagereenga. Let's go! 💪`
        : `Interview started! You're practicing for ${jobRole}. Answer each question to the best of your ability. Let's begin! 🎯`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit interview answer
// @route   POST /api/interview/answer
// @access  Private
exports.submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, questionIndex, answer } = req.body;
    const user = req.user;

    if (!sessionId || questionIndex === undefined || !answer) {
      return res.status(400).json({ success: false, message: 'sessionId, questionIndex, and answer are required' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId: user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    const question = session.questions[questionIndex];
    if (!question) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    // Evaluate the answer
    const feedback = aiService.evaluateInterviewAnswer(
      question.question,
      answer,
      session.jobRole,
      user.languageMode
    );

    // Save answer
    const answerDoc = {
      questionIndex,
      userAnswer: answer,
      betterAnswer: feedback.betterAnswer,
      betterAnswerTamil: feedback.betterAnswerTamil,
      grammarCorrections: feedback.grammarCorrections,
      confidenceScore: feedback.confidenceScore,
      fluencyScore: feedback.fluencyScore,
      contentScore: feedback.contentScore,
      overallScore: feedback.overallScore,
      answeredAt: new Date(),
    };

    session.answers.push(answerDoc);

    // Check if interview is complete
    const isComplete = session.answers.length >= session.questions.length;
    if (isComplete) {
      session.status = 'COMPLETED';
      const avgScore = session.answers.reduce((sum, a) => sum + a.overallScore, 0) / session.answers.length;
      session.overallScore = Math.round(avgScore);
      session.finalFeedback = {
        strengths: feedback.strengths,
        improvements: feedback.improvements,
        summary: `You completed the ${session.jobRole} interview with an overall score of ${session.overallScore}/100. ${session.overallScore >= 70 ? 'Excellent performance!' : 'Keep practicing to improve!'}`,
        summaryTamil: user.languageMode === 'TAMIL_ASSISTED'
          ? `Neenga ${session.jobRole} interview complete panneenga! Score: ${session.overallScore}/100. ${session.overallScore >= 70 ? 'Romba nalla! 🌟' : 'Practice continue pannunga! 💪'}`
          : ''
      };

      // Save score
      await SpeakingScore.create({
        userId: user._id,
        sessionType: 'INTERVIEW',
        topic: session.jobRole,
        languageMode: user.languageMode,
        scores: {
          fluency: feedback.fluencyScore,
          grammar: feedback.grammarScore,
          confidence: feedback.confidenceScore,
          overall: session.overallScore,
        },
        xpEarned: Math.floor(session.overallScore * 0.8),
      });

      await User.findByIdAndUpdate(user._id, {
        $inc: { xp: Math.floor(session.overallScore * 0.8) }
      });
    }

    await session.save();

    res.json({
      success: true,
      feedback: {
        overallScore: feedback.overallScore,
        contentScore: feedback.contentScore,
        grammarScore: feedback.grammarScore,
        confidenceScore: feedback.confidenceScore,
        fluencyScore: feedback.fluencyScore,
        betterAnswer: feedback.betterAnswer,
        betterAnswerTamil: feedback.betterAnswerTamil,
        grammarCorrections: feedback.grammarCorrections,
        strengths: feedback.strengths,
        improvements: feedback.improvements,
      },
      isComplete,
      finalFeedback: isComplete ? session.finalFeedback : null,
      overallScore: isComplete ? session.overallScore : null,
      nextQuestionIndex: isComplete ? null : questionIndex + 1,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get interview history
// @route   GET /api/interview/history
// @access  Private
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-questions.questionTamil -__v');

    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { startInterview, submitAnswer, getInterviewHistory } = require('../controllers/interviewController');

router.post('/start', protect, startInterview);
router.post('/answer', protect, submitAnswer);
router.get('/history', protect, getInterviewHistory);

module.exports = router;

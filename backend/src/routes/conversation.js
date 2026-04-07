const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  startConversation,
  sendMessage,
  getHistory,
  endConversation,
  getChallenges,
  submitChallenge,
} = require('../controllers/conversationController');

router.post('/start', protect, startConversation);
router.post('/message', protect, sendMessage);
router.get('/history', protect, getHistory);
router.put('/:id/end', protect, endConversation);
router.get('/challenges', protect, getChallenges);
router.post('/challenge/submit', protect, submitChallenge);

module.exports = router;

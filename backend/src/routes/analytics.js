const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserStats } = require('../controllers/analyticsController');

router.get('/stats', protect, getUserStats);

module.exports = router;

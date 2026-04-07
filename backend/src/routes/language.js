const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { updateLanguageMode, updatePersonality } = require('../controllers/analyticsController');

router.post('/language-mode', protect, updateLanguageMode);
router.post('/personality', protect, updatePersonality);

module.exports = router;

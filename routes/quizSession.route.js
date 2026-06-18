const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const {
    startQuiz,
    updateQuiz,
    getQuizHistory,
    getQuizResult,
    getLeaderboard,
} = require('../controllers/quizSession.controller');

router.post('/start', auth, startQuiz);
router.put('/update/:sessionId', auth, updateQuiz);
router.get('/history/', auth, getQuizHistory);
router.get('/result/:sessionId', auth, getQuizResult);
router.get('/leaderboard', auth, getLeaderboard);

module.exports = router;
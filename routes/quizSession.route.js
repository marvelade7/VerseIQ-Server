const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const {
    startQuiz,
    updateQuiz,
    getQuizHistory,
    getQuizResult,
} = require('../controllers/quizSession.controller');

router.post('/start', auth, startQuiz);
router.put('/update/:sessionId', auth, updateQuiz);
router.get('/history/:userId', auth, getQuizHistory);
router.get('/result/:sessionId', auth, getQuizResult);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
    allQuestions,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    randomQuestion,
    newTestamentQuestions,
    oldTestamentQuestions,
    randomQuestions,
} = require("../controllers/question.controller");

// Route to get all questions
router.get("/all-questions", allQuestions);
router.get("/easy", easyQuestions);
router.get("/medium", mediumQuestions);
router.get("/hard", hardQuestions);
router.get("/random", randomQuestion);
router.get("/new-testament", newTestamentQuestions);
router.get("/old-testament", oldTestamentQuestions);
router.get("/random/:count", randomQuestions);

module.exports = router;

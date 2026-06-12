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
    getQuestionsByIds,
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
router.post("/by-ids", getQuestionsByIds);
// temporarily add this to your question routes
router.get("/debug-categories", (req, res) => {
    Question.distinct("category").then((cats) => res.json(cats));
});

module.exports = router;

const Question = require("../models/question.model");

const allQuestions = (req, res) => {
    Question.find()
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const easyQuestions = (req, res) => {
    Question.find({ difficulty: "easy" })
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const mediumQuestions = (req, res) => {
    Question.find({ difficulty: "medium" })
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const hardQuestions = (req, res) => {
    Question.find({ difficulty: "hard" })
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const randomQuestion = (req, res) => {
    Question.aggregate([{ $sample: { size: 1 } }])
        .then((question) => res.json(question[0]))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const newTestamentQuestions = (req, res) => {
    Question.find({ category: "New Testament" })
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const oldTestamentQuestions = (req, res) => {
    Question.find({ category: "Old Testament" })
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const randomQuestions = (req, res) => {
    const count = parseInt(req.params.count);
    const questions = Question.aggregate([{ $sample: { size: count } }])
        .then((questions) => res.json(questions))
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

module.exports = {
    allQuestions,
    easyQuestions,
    mediumQuestions,
    hardQuestions,
    randomQuestion,
    newTestamentQuestions,
    oldTestamentQuestions,
    randomQuestions,
};

const mongoose = require("mongoose");

const quizSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        default: 0,
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
        },
    ],
    correctAnswers: {
        type: Number,
        default: 0,
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["in-progress", "completed"],
        default: "in-progress",
    },
    answers: [
        {
            question: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
                required: true,
            },
            selectedOption: {
                type: mongoose.Schema.Types.ObjectId, // the option _id they picked
                required: false,
            },
            isCorrect: {
                type: Boolean,
                required: true,
            },
            timeTaken: {
                type: Number, // seconds spent on this specific question
                default: 0,
            },
        },
    ],
    streak: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // percentage
    timeTaken: { type: Number, default: 0 }, // in seconds
});

exports = module.exports = mongoose.model("QuizSession", quizSessionSchema);
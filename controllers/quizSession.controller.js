const QuizSession = require("../models/quizSession.model");
const Question = require("../models/question.model");
const User = require("../models/user.model");

const startQuiz = (req, res) => {
    const userId = req.user._id;
    const { category, difficulty, count } = req.body;
    const filter = {};

    if (category && category !== "mixed") filter.category = category;
    if (difficulty && difficulty !== "mixed") filter.difficulty = difficulty;

    Question.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(count) || 10 } },
    ])
        .then((questions) => {
            if (questions.length < (parseInt(count) || 10)) {
                return res.status(400).json({
                    message: `Not enough questions. Only ${questions.length} available for this filter.`,
                });
            }

            const session = new QuizSession({
                userId,
                category: category || "mixed",
                difficulty: difficulty || "mixed",
                totalQuestions: questions.length,
                questions: questions.map((q) => q._id),
            });

            return session.save().then((newSession) => {
                res.status(201).json({
                    status: "success",
                    message: "Quiz session started",
                    data: {
                        sessionId: newSession._id,
                        questions: newSession.questions,
                    },
                });
            });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const updateQuiz = (req, res) => {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const {
        score,
        correctAnswers,
        status,
        streak,
        accuracy,
        timeTaken,
        answers,
    } = req.body;

    QuizSession.findOne({ _id: sessionId, userId })
        .then((session) => {
            if (!session) {
                return res
                    .status(404)
                    .json({ message: "Session not found or unauthorized." });
            }
            session.score = score;
            session.correctAnswers = correctAnswers;
            session.status = status;
            session.streak = streak;
            session.accuracy = accuracy;
            session.timeTaken = timeTaken;
            session.answers = answers;
            if (status === "completed") session.completedAt = Date.now();

            if (status === "completed") {
                const DIFFICULTY_MULTIPLIERS = {
                    easy: 1,
                    mixed: 1.5,
                    medium: 2,
                    hard: 3,
                };
                const multiplier =
                    DIFFICULTY_MULTIPLIERS[session.difficulty] || 1;
                const percentage =
                    (correctAnswers / session.totalQuestions) * 100;
                const basePoints = Math.round(percentage * multiplier);
                const lengthBonus = Math.round(
                    session.totalQuestions * 0.5 * multiplier,
                );
                session.leaderboardPoints = basePoints + lengthBonus;
            }

            return session.save().then((updatedSession) => {
                if (status !== "completed") {
                    return res.json({
                        status: "success",
                        message: "Quiz session updated",
                        data: updatedSession,
                    });
                }
                return User.findById(userId).then((user) => {
                    if (user) {
                        user.totalQuizTaken += 1;
                        user.totalScore += score;
                        if (score > user.bestScore) user.bestScore = score;
                        if (streak > user.longestStreak)
                            user.longestStreak = streak;

                        return user.save().then((savedUser) => {
                            // console.log("Updated user:", savedUser);
                            res.json({
                                status: "success",
                                data: updatedSession,
                                user: savedUser,
                            });
                        });
                    }
                });
            });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const getQuizHistory = (req, res) => {
    const userId = req.user._id;

    QuizSession.find({ userId })
        .sort({ startedAt: -1 })
        .populate({
            path: "answers.question",
            select: "questionText options reference difficulty category",
        })
        .then((sessions) => res.json(sessions))
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const getQuizResult = (req, res) => {
    const { sessionId } = req.params;

    QuizSession.findById(sessionId)
        .populate({
            path: "answers.question",
            select: "questionText options reference difficulty category",
        })
        .then((session) => {
            if (!session) {
                return res.status(404).json({ message: "Session not found" });
            }
            res.json({
                status: "success",
                data: session,
            });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const getLeaderboard = (req, res) => {
    QuizSession.aggregate([
        { $match: { status: "completed" } },
        {
            $group: {
                _id: "$userId",
                totalPoints: { $sum: "$leaderboardPoints" },
                quizzesCompleted: { $sum: 1 },
                averageAccuracy: { $avg: "$accuracy" },
                totalCorrectAnswers: { $sum: "$correctAnswers" },
                totalQuestions: { $sum: "$totalQuestions" },
                highestStreak: { $max: "$streak" },
            },
        },
        { $sort: { totalPoints: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                username: "$user.username",
                firstName: "$user.firstName",
                lastName: "$user.lastName",
                totalPoints: 1,
                quizzesCompleted: 1,
                averageAccuracy: { $round: ["$averageAccuracy", 1] },
                totalCorrectAnswers: 1,
                totalQuestions: 1,
                highestStreak: 1,
            },
        },
    ])
        .then((leaderboard) => {
            const ranked = leaderboard.map((entry, index) => ({
                rank: index + 1,
                ...entry,
            }));
            res.json(ranked);
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const recalculateUserStats = () => {
    User.find().then((users) => {
        const updates = users.map((user) => {
            return QuizSession.find({
                userId: user._id,
                status: "completed",
            }).then((sessions) => {
                const totalQuizTaken = sessions.length;
                const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
                const bestScore = sessions.length > 0
                    ? Math.max(...sessions.map((s) => s.score))
                    : 0;
                const longestStreak = sessions.length > 0
                    ? Math.max(...sessions.map((s) => s.streak))
                    : 0;

                return User.findByIdAndUpdate(user._id, {
                    totalQuizTaken,
                    totalScore,
                    bestScore,
                    longestStreak,
                });
            });
        });

        Promise.all(updates).then(() => console.log("User stats recalculated"));
    });
};

module.exports = {
    startQuiz,
    updateQuiz,
    getQuizHistory,
    getQuizResult,
    getLeaderboard,
    recalculateUserStats
};

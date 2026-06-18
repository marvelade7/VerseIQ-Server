const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        totalQuizTaken: {
            type: Number,
            default: 0,
        },
        bestScore: {
            type: Number,
            default: 0,
        },
        longestStreak: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        questionText: {
            type: String,
            required: true,
        },
        options: [
            {
                optionText: {
                    type: String,
                    required: true,
                },
                isCorrect: {
                    type: Boolean,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },
        reference: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);    
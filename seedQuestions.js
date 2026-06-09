// scripts/seedQuestions.js
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/question.model');
const questions = require('./questions.json');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    await Question.deleteMany();
    console.log('Cleared existing questions');

    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} questions seeded successfully`);

    process.exit();
}).catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
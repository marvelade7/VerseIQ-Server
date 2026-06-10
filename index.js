const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.route");
const questionRoutes = require("./routes/question.route");
const quizSessionRoutes = require("./routes/quizSession.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Routes
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz-sessions", quizSessionRoutes);
// Server
app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});
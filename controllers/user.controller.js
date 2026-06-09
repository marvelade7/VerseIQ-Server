const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    User.findOne({ email }).then((existingUser) => {
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        newUser
            .save()
            .then((user) => {
                const token = jwt.sign({ id: user._id }, JWT_SECRET, {
                    expiresIn: "2h",
                });
                console.log(user);
                res.status(201).json({
                    token,
                    message: "User registered successfully",
                    user,
                });
            })
            .catch((err) => {
                console.error("Error saving user:", err);
                res.status(500).json({ message: "Server error" });
            });
    });
};

const loginUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Email and password are required" });
    }

    User.findOne({ email }).then((user) => {
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: "2h",
        });
        res.json({ token, message: "Login successful", user });
    });
};

module.exports = {
    registerUser,
    loginUser,
};

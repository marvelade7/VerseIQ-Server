const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = (req, res) => {
    const { firstName, lastName, email, username, password, confirmPassword } =
        req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !username ||
        !password ||
        !confirmPassword
    ) {
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
                res.status(500).json({
                    message: "Server error",
                    error: err.message,
                });
            });
    });
};

const loginUser = (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res
            .status(400)
            .json({ message: "Email or username and password are required" });
    }

    const query = identifier.includes("@")
        ? { email: identifier }
        : { username: identifier };

    User.findOne(query)
        .then((user) => {
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: user._id }, JWT_SECRET, {
                expiresIn: "1h",
            });

            const { password: _, ...safeUser } = user.toObject();
            res.json({ token, message: "Login successful", user: safeUser });
        })
        .catch((err) => res.status(500).json({ message: "Server error" }));
};

const getUserProfile = (req, res) => {
    const userId = req.user._id;

    User.findById(userId)
        .select("-password")
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const updateProfile = (req, res) => {
    const userId = req.user._id;
    const {
        firstName,
        lastName,
        username,
        email,
        currentPassword,
        newPassword,
    } = req.body;

    User.findById(userId)
        .select("+password")
        .then(async (user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (username && username !== user.username) {
                const existingUsername = await User.findOne({ username });
                if (existingUsername) {
                    return res
                        .status(400)
                        .json({ message: "Username already taken" });
                }
            }

            if (email && email !== user.email) {
                const existingEmail = await User.findOne({ email });
                if (existingEmail) {
                    return res
                        .status(400)
                        .json({ message: "Email already in use" });
                }
            }

            if (newPassword) {
                if (!currentPassword) {
                    return res.status(400).json({
                        message: "Please provide your current password",
                    });
                }
                const isMatch = await bcrypt.compare(
                    currentPassword,
                    user.password,
                );
                if (!isMatch) {
                    return res
                        .status(400)
                        .json({ message: "Current password is incorrect" });
                }
                user.password = await bcrypt.hash(newPassword, 12);
            }

            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (username) user.username = username;
            if (email) user.email = email;

            // If a new avatar was uploaded, save the Cloudinary URL
            if (req.file) {
                user.avatar = req.file.path; // Cloudinary URL
            }

            return user.save();
        })
        .then((updatedUser) => {
            if (!updatedUser) return;

            const userObj = updatedUser.toObject();
            delete userObj.password;

            res.json({
                status: "success",
                message: "Profile updated successfully",
                data: userObj,
            });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

const getDashboard = (req, res) => {
    const userId = req.user._id;

    User.findById(userId)
        .select("-password")
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user });
        })
        .catch((err) =>
            res
                .status(500)
                .json({ message: "Server error", error: err.message }),
        );
};

module.exports = {
    registerUser,
    loginUser,
    updateProfile,
    getDashboard,
};

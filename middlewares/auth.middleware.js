const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user to request
        User.findById(decoded.id)
            .select("-password")
            .then((user) => {
                if (!user) {
                    return res.status(401).json({ message: "User no longer exists." });
                }
                req.user = user;
                next();
            })
            .catch((err) => res.status(500).json({ message: "Server error", err }));

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Session expired. Please log in again." });
        }
        return res.status(401).json({ message: "Invalid token." });
    }
};

module.exports = { auth };
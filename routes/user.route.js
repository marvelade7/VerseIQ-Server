const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateProfile, getDashboard } = require('../controllers/user.controller');
const { upload } = require("../config/cloudinary");
const { auth } = require('../middlewares/auth.middleware');


router.post('/register', registerUser);
router.post('/login', loginUser);
router.put("/profile", auth, upload.single("avatar"), updateProfile);
router.get("/dashboard", auth, getDashboard);

module.exports = router;
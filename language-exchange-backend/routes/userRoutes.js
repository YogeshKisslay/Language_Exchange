const express = require("express");
const { getProfile, logout } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Get user profile (protected)
router.get("/profile", authenticateUser, getProfile);

// Logout
router.post("/logout", authenticateUser, logout);

module.exports = router;

const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");
const callController = require("../controllers/callController");
const { authenticateUser } = require("../middleware/authMiddleware"); // Import your middleware

// Token generation route (no auth required for cron job)
router.post("/generate-tokens", tokenController.generatePowerToken);

// Call-related routes (protected by authenticateUser)
router.post("/initiate-call", authenticateUser, callController.initiateCall);
router.post("/accept-call", authenticateUser, callController.acceptCall);
router.post("/end-call", authenticateUser, callController.endCall);
router.post("/extend-call", authenticateUser, callController.extendCall);

module.exports = router;

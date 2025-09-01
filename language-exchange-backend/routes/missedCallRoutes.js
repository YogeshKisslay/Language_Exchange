const express = require("express");
const router = express.Router();
const missedCallController = require("../controllers/missedCallController");
const { authenticateUser } = require("../middleware/authMiddleware");

router.get("/", authenticateUser, missedCallController.getMissedCalls);
router.delete("/:callId", authenticateUser, missedCallController.dismissMissedCall);

module.exports = router;
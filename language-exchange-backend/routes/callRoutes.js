// const express = require("express");
// const router = express.Router();
// const tokenController = require("../controllers/tokenController");
// const callController = require("../controllers/callController");
// const { authenticateUser } = require("../middleware/authMiddleware"); // Import your middleware

// // Token generation route (no auth required for cron job)
// router.post("/generate-tokens", tokenController.generatePowerToken);

// // Call-related routes (protected by authenticateUser)
// router.post("/initiate-call", authenticateUser, callController.initiateCall);
// router.post("/accept-call", authenticateUser, callController.acceptCall);
// router.post("/end-call", authenticateUser, callController.endCall);
// router.post("/extend-call", authenticateUser, callController.extendCall);

// module.exports = router;



// APIIIIIIIIIIII

// const express = require("express");
// const router = express.Router();
// const callController = require("../controllers/callController");
// const { authenticateUser } = require("../middleware/authMiddleware"); // Updated to authenticateUser

// console.log("callController:", callController); // Debug line

// router.post("/initiate", authenticateUser, callController.initiateCall);
// router.post("/accept", authenticateUser, callController.acceptCall);
// router.post("/end", authenticateUser, callController.endCall);
// router.post("/extend", authenticateUser, callController.extendCall);
// router.post("/cancel", authenticateUser, callController.cancelCall);
// router.post("/set-online", authenticateUser, callController.setOnlineStatus);

// module.exports = router;




const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { authenticateUser } = require("../middleware/authMiddleware");

console.log("callController:", callController); // Debug line

router.post("/initiate", authenticateUser, callController.initiateCall);
router.post("/accept", authenticateUser, callController.acceptCall);
router.post("/end", authenticateUser, callController.endCall);
router.post("/extend", authenticateUser, callController.extendCall);
router.post("/cancel", authenticateUser, callController.cancelCall);
router.post("/set-online", authenticateUser, callController.setOnlineStatus);

module.exports = router;



// const express = require("express");
// const router = express.Router();
// const callController = require("../controllers/callController");
// const { authenticateUser } = require("../middleware/authMiddleware");

// console.log("callController:", callController); // Debug line

// router.post("/initiate", authenticateUser, callController.initiateCall);
// router.post("/accept", authenticateUser, callController.acceptCall);
// router.post("/end", authenticateUser, callController.endCall);
// router.post("/extend", authenticateUser, callController.extendCall);
// router.post("/cancel", authenticateUser, callController.cancelCall);
// router.post("/set-online", authenticateUser, callController.setOnlineStatus);

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const callController = require("../controllers/callController");
// const { authenticateUser } = require("../middleware/authMiddleware");

// console.log("callController:", callController);

// router.post("/initiate", authenticateUser, callController.initiateCall);
// router.post("/accept", authenticateUser, callController.acceptCall);
// router.post("/end", authenticateUser, callController.endCall);
// router.post("/extend", authenticateUser, callController.extendCall);
// router.post("/cancel", authenticateUser, callController.cancelCall);
// router.post("/set-online", authenticateUser, callController.setOnlineStatus);
// router.get("/current-call", authenticateUser, callController.getCurrentCall); // New route

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const callController = require("../controllers/callController");
// const { authenticateUser } = require("../middleware/authMiddleware");
// const tokenController = require("../controllers/tokenController");
// console.log("callController:", callController);
// router.post("/generate-tokens", tokenController.generatePowerToken);
// router.post("/initiate", authenticateUser, callController.initiateCall);
// router.post("/accept", authenticateUser, callController.acceptCall);
// router.post("/reject", authenticateUser, callController.rejectCall); // New route
// router.post("/end", authenticateUser, callController.endCall);
// router.post("/extend", authenticateUser, callController.extendCall);
// router.post("/cancel", authenticateUser, callController.cancelCall);
// router.post("/set-online", authenticateUser, callController.setOnlineStatus);
// router.get("/current-call", authenticateUser, callController.getCurrentCall);

// module.exports = router;



const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { authenticateUser } = require("../middleware/authMiddleware");
const tokenController = require("../controllers/tokenController");

console.log("callController:", callController);

router.post("/generate-tokens", tokenController.generatePowerToken); // Existing token generation route
router.post("/initiate", authenticateUser, callController.initiateCall);
router.post("/accept", authenticateUser, callController.acceptCall);
router.post("/reject", authenticateUser, callController.rejectCall);
router.post("/end", authenticateUser, callController.endCall);
router.post("/extend", authenticateUser, callController.extendCall);
router.post("/approve-extend", authenticateUser, callController.approveExtendCall); // New route for approving extension
router.post("/cancel", authenticateUser, callController.cancelCall);
router.post("/set-online", authenticateUser, callController.setOnlineStatus);
router.get("/current-call", authenticateUser, callController.getCurrentCall);
router.post('/initiate-selective', authenticateUser, callController.initiateSelectiveCall); // New route
module.exports = router;
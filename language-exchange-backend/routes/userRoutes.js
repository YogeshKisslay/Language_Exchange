// const express = require("express");
// const { getProfile, logout } = require("../controllers/userController");
// const { authenticateUser } = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get user profile (protected)
// router.get("/profile", authenticateUser, getProfile);

// // Logout
// router.post("/logout", authenticateUser, logout);

// module.exports = router;


// const express = require("express");


// const { getProfile, updateProfile, logout } = require("../controllers/userController");
// const { authenticateUser } = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get user profile (protected)
// router.get("/profile", authenticateUser, getProfile);

// // Update user profile (protected)
// router.put("/profile", authenticateUser, updateProfile);

// // Logout
// router.post("/logout", authenticateUser, logout);


// module.exports = router;


// const express = require("express");

// const userController = require('../controllers/userController');
// const { getProfile, updateProfile, logout } = require("../controllers/userController");
// const { authenticateUser } = require("../middleware/authMiddleware");

// const router = express.Router();

// // Get user profile (protected)
// router.get("/profile", authenticateUser, getProfile);

// // Update user profile (protected)
// router.put("/profile", authenticateUser, updateProfile);

// // Logout
// router.post("/logout", authenticateUser, logout);


// module.exports = router;

// const express = require("express");
// const userController = require('../controllers/userController');
// const { authenticateUser } = require("../middleware/authMiddleware");

// const router = express.Router();

// router.get("/profile", authenticateUser, userController.getProfile);
// router.put("/profile", authenticateUser, userController.updateProfile);
// router.post("/logout", authenticateUser, userController.logout);
// router.post('/payment/order', authenticateUser, userController.createPaymentOrder);
// router.post('/payment/verify', authenticateUser, userController.verifyPayment);
// router.get('/all-users', authenticateUser, userController.getAllUsers);
// router.post('/send-email', authenticateUser, userController.sendEmailToUser);

// module.exports = router;


const express = require("express");
const userController = require('../controllers/userController');
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Get authenticated user's profile (no userId)
router.get("/profile", authenticateUser, userController.getProfile);
// Get any user's profile by userId
router.get("/profile/:userId", authenticateUser, userController.getProfile);
// Update authenticated user's profile
router.put("/profile", authenticateUser, userController.updateProfile);
router.post("/logout", authenticateUser, userController.logout);
router.post('/payment/order', authenticateUser, userController.createPaymentOrder);
router.post('/payment/verify', authenticateUser, userController.verifyPayment);
router.get('/all-users', authenticateUser, userController.getAllUsers);
router.post('/send-email', authenticateUser, userController.sendEmailToUser);

module.exports = router;
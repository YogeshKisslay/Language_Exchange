// const express = require("express");
// const { registerUser, verifyUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

// const router = express.Router();

// router.post("/register", registerUser);
// router.get("/verify/:token", verifyUser);
// router.post("/login", loginUser);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password/:token", resetPassword);

// module.exports = router;



const express = require("express");
const passport = require("passport");
const {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  auth0Login,
  logoutUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.get("/verify/:token", verifyUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Auth0 authentication route
// router.get("/auth0", passport.authenticate("auth0", { scope: "openid email profile" }));
router.get(
  "/auth0",
  passport.authenticate("auth0", { scope: "openid email profile", prompt: "login" })
);

router.get("/auth0/callback", passport.authenticate("auth0"), auth0Login);
router.get("/auth0/logout", logoutUser);
module.exports = router;



const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { sendVerificationEmail } = require("../services/emailService");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.googleId) {
      return res.status(400).json({ message: "Use Auth0 login instead" });
    }
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  if (user) {
    sendVerificationEmail(user);
    res.status(201).json({ message: "Verification email sent" });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.isVerified = true;
    await user.save();

    res.redirect(`${process.env.FRONTEND_URL}`);
  } catch (error) {
    console.error("Email verification failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.isVerified) {
    return res.status(401).json({ message: "Invalid email or not verified" });
  }
  if (user.googleId) {
    return res.status(400).json({ message: "Use Auth0 login instead" });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id);
  
  // REMOVE the cookie-setting logic.
  // We will now send the token directly in the response body.
  
  res.json({
    message: "Logged in successfully",
    token, // The token is now a part of the JSON response.
    user: { name: user.name, _id: user._id, // Add other user fields
      knownLanguages: user.knownLanguages,
      learnLanguages: user.learnLanguages,
      powerTokens: user.powerTokens,
      coinTokens: user.coinTokens,
      premium: user.premium
    },
  });
});

// const auth0Login = asyncHandler(async (req, res) => {
//   const { emails, name, sub: googleId } = req.user;
//   const email = emails?.[0]?.value || "";
//   const fullName = `${name.givenName || ""} ${name.familyName || ""}`.trim();

//   let user = await User.findOne({ email });
//   if (!user) {
//     user = await User.create({
//       name: fullName,
//       email,
//       googleId,
//       isVerified: true,
//     });
//   } else if (!user.googleId) {
//     user.googleId = googleId;
//     await user.save();
//   }

//   const token = generateToken(user._id);

//   // Instead of redirecting with a cookie, redirect with the token as a query parameter.
//   // The frontend can then read this parameter.
//   res.redirect(`${process.env.FRONTEND_URL}/auth0-callback?token=${token}`);
// });

const auth0Login = asyncHandler(async (req, res) => {
  // Correctly extract the email and name from Auth0's profile data
  // Auth0 returns email in an array, so we access the value from the first element.
  // The name is a nested object, so we build the full name.
  const email = req.user.emails[0].value;
  const name = `${req.user.name.givenName} ${req.user.name.familyName}`.trim();
  const googleId = req.user.sub;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      // Provide the correctly extracted name and email
      name: name,
      email: email,
      googleId,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const token = generateToken(user._id);

  res.redirect(`${process.env.FRONTEND_URL}/auth0-callback?token=${token}`);
});

const logoutUser = asyncHandler(async (req, res) => {
  // REMOVE all cookie-clearing logic.
  res.status(200).json({ message: "Logged out successfully" });
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  sendVerificationEmail(user, "reset");
  res.json({ message: "Password reset email sent" });
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { newPassword } = req.body;
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid token" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});


// // this is for auth0 not needed
// const logoutUser = asyncHandler(async (req, res) => {
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction, // true in production  
//     sameSite: isProduction ? 'none' : 'lax', // 'none' in production
//     path: '/',
//     expires: new Date(0), // Expire immediately (Unix epoch)
//   };
//   res.clearCookie("token", cookieOptions);
//   console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
//   res.status(200).json({ message: "Logged out successfully" }); 
// });
module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  auth0Login,
  logoutUser,
};
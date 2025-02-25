// const User = require("../models/userModel");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
// const { sendVerificationEmail } = require("../services/emailService");

// // Generate JWT token
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
// };

// // Register user
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     res.status(400).json({ message: "User already exists" });
//     return;
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await User.create({ name, email, password: hashedPassword });

//   if (user) {
//     sendVerificationEmail(user);
//     res.status(201).json({ message: "Verification email sent" });
//   } else {
//     res.status(400).json({ message: "Invalid user data" });
//   }
// });

// // Verify email
// // const verifyUser = asyncHandler(async (req, res) => {
// //   const { token } = req.params;
// //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
// //   const user = await User.findById(decoded.id);

// //   if (!user) {
// //     res.status(400).json({ message: "Invalid token" });
// //     return;
// //   }

// //   user.isVerified = true;
// //   await user.save();
// //   res.json({ message: "Email verified. You can log in now." });
// // });


// const verifyUser = asyncHandler(async (req, res) => {
//     try {
//       const { token } = req.params;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findById(decoded.id);
  
//       if (!user) {
//         return res.status(400).json({ message: "Invalid token" });
//       }
  
//       user.isVerified = true;
//       await user.save();
  
//       // Redirect to frontend login page after verification
//     //   res.redirect(`${process.env.FRONTEND_URL}/login`);
//     } catch (error) {
//       console.error("Email verification failed:", error.message);
//       res.status(400).json({ message: "Invalid or expired token" });
//     }
//   });

// // Login user
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user || !user.isVerified) {
//     res.status(401).json({ message: "Invalid email or not verified" });
//     return;
//   }

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     res.status(401).json({ message: "Invalid credentials" });
//     return;
//   }

//   res.cookie("token", generateToken(user._id), { httpOnly: true });
//   res.json({ message: "Logged in successfully" });
// });

// // Forgot password
// const forgotPassword = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   if (!user) {
//     res.status(404).json({ message: "User not found" });
//     return;
//   }

//   sendVerificationEmail(user, "reset");
//   res.json({ message: "Password reset email sent" });
// });

// // Reset password
// // const resetPassword = asyncHandler(async (req, res) => {
// //   const { token } = req.params;
// //   const { newPassword } = req.body;
// //   const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
// //   const user = await User.findById(decoded.id);
//   // user.password = await bcrypt.hash(newPassword, 10);
//   // await user.save();
  
//   // res.json({ message: "Password updated successfully" });
// // });
// const resetPassword = asyncHandler(async (req, res) => {
//     try {
//       const { token } = req.params;
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const { newPassword } = req.body;
//       const user = await User.findById(decoded.id);
  
//       if (!user) {
//         return res.status(400).json({ message: "Invalid token" });
//       }
//       user.password = await bcrypt.hash(newPassword, 10);
//       await user.save();
      
//       res.json({ message: "Password updated successfully" });
//       // res.redirect(`${process.env.FRONTEND_URL}/reset-password/${token}`);
//     } catch (error) {
//       console.error("Password reset failed:", error.message);
//       res.status(400).json({ message: "Invalid or expired token" });
//     }
//   });

// module.exports = { registerUser, verifyUser, loginUser, forgotPassword, resetPassword };




// Register User
// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const userExists = await User.findOne({ email });
//   if (userExists) {
//     res.status(400).json({ message: "User already exists" });
//     return;
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await User.create({ name, email, password: hashedPassword });

//   if (user) {
//     sendVerificationEmail(user);
//     res.status(201).json({ message: "Verification email sent" });
//   } else {
//     res.status(400).json({ message: "Invalid user data" });
//   }
// });



// **Auth0 Login**
// const auth0Login = asyncHandler(async (req, res) => {
//   const { name, email, sub: googleId } = req.user;

//   let user = await User.findOne({ email });

//   if (!user) {
//     // Create user if they don’t exist
//     user = await User.create({
//       name,
//       email,
//       googleId,
//       isVerified: true, // Auth0 verifies the email
//     });
//   } else if (!user.googleId) {
//     // If user exists but was registered manually, link Google ID
//     user.googleId = googleId;
//     await user.save();
//   }

//   // Generate JWT for frontend authentication
//   const token = generateToken(user._id);
//   res.cookie("token", token, { httpOnly: true });
//   res.json({ message: "Authenticated via Auth0", token });
// });



// const logoutUser = (req, res) => {
//   const auth0Domain = process.env.AUTH0_DOMAIN;
//   const clientId = process.env.AUTH0_CLIENT_ID;
//   const returnTo = process.env.FRONTEND_URL + "/login";

//   res.redirect(`https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`);
// };

// const logoutUser = (req, res, next) => {
//   const auth0Domain = process.env.AUTH0_DOMAIN;
//   const clientId = process.env.AUTH0_CLIENT_ID;
//   const returnTo = `${process.env.FRONTEND_URL}/login`;

//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect(`https://${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${returnTo}`);
//   });
// };


// const auth0Login = asyncHandler(async (req, res) => {
//   const { emails, name, sub: googleId } = req.user;
  
//   // Extract email correctly
//   const email = emails?.[0]?.value || "";

//   // Convert name to a string
//   const fullName = `${name.givenName || ""} ${name.familyName || ""}`.trim();

//   let user = await User.findOne({ email });

//   if (!user) {
//     // Create user if they don’t exist
//     user = await User.create({
//       name: fullName,  // ✅ Now a valid string
//       email,
//       googleId,
//       isVerified: true, // Auth0 verifies the email
//     });
//   } else if (!user.googleId) {
//     // If user exists but was registered manually, link Google ID
//     user.googleId = googleId;
//     await user.save();
//   }

//   // Generate JWT for frontend authentication
//   const token = generateToken(user._id);
//   res.cookie("token", token, { httpOnly: true });
//   res.json({ message: "Authenticated via Auth0", token });
  
// });




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

// const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password } = req.body;

//   const existingUser = await User.findOne({ email });

//   if (existingUser) {
//     if (existingUser.googleId) {
//       return res.status(400).json({ message: "Use Auth0 login instead" });
//     } else {
//       return res.status(400).json({ message: "User already exists" });
//     }
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const user = await User.create({ name, email, password: hashedPassword });

//   if (user) {
//     sendVerificationEmail(user);
//     res.status(201).json({ message: "Verification email sent" });
//   } else {
//     res.status(400).json({ message: "Invalid user data" });
//   }
// });

// Verify User
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

    res.redirect(`${process.env.FRONTEND_URL}/login`);
  } catch (error) {
    console.error("Email verification failed:", error.message);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

// Login User
// const loginUser = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user || !user.isVerified) {
//     res.status(401).json({ message: "Invalid email or not verified" });
//     return;
//   }
//   if (user.googleId) {
//     return res.status(400).json({ message: "Use Auth0 login instead" });
//   }
//   const match = await bcrypt.compare(password, user.password);
//   if (!match) {
//     res.status(401).json({ message: "Invalid credentials" });
//     return;
//   }

//   res.cookie("token", generateToken(user._id), { httpOnly: true });
//   res.json({ message: "Logged in successfully" });
// });



const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isVerified) {
    res.status(401).json({ message: "Invalid email or not verified" });
    return;
  }
  if (user.googleId) {
    return res.status(400).json({ message: "Use Auth0 login instead" });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user._id);
  res.cookie("token", token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ 
    message: "Logged in successfully",
    token,
    user: { name: user.name } // Include user data for avatar
  });
});

// Forgot Password
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

// Reset Password
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



// const auth0Login = asyncHandler(async (req, res) => {
//   const { emails, name, sub: googleId } = req.user;
  
//   // Extract email correctly
//   const email = emails?.[0]?.value || "";

//   // Convert name to a string
//   const fullName = `${name.givenName || ""} ${name.familyName || ""}`.trim();

//   let user = await User.findOne({ email });

//   if (!user) {
//     // Create user if they don’t exist
//     user = await User.create({
//       name: fullName,
//       email,
//       googleId,
//       isVerified: true, // Auth0 verifies the email
//     });
//   } else if (!user.googleId) {
//     // If user exists but was registered manually, link Google ID
//     user.googleId = googleId;
//     await user.save();
//   }

//   // Generate JWT for frontend authentication
//   const token = generateToken(user._id);
  
//   // Set the token in an httpOnly cookie
//   res.cookie("token", token, { 
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // Use secure cookies in production
//     sameSite: "strict", // Optional: Enhance security
//   });

//   // Redirect to frontend homepage
//   res.redirect("http://localhost:3000");
// });
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
//   res.cookie("token", token, { 
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });
//   res.redirect("http://localhost:3000");
// });
const auth0Login = asyncHandler(async (req, res) => {
  const { emails, name, sub: googleId } = req.user;
  const email = emails?.[0]?.value || "";
  const fullName = `${name.givenName || ""} ${name.familyName || ""}`.trim();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: fullName,
      email,
      googleId,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  const token = generateToken(user._id);
  res.cookie("token", token, { 
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  console.log('Auth0 Login - Token:', token); // Debug
  res.redirect("http://localhost:3000");
});
const logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    // Destroy session if using express-session
    if (req.session) {
      req.session.destroy((err) => {
        if (err) return next(err);
      });
    }

    // Clear authentication cookies
    res.clearCookie("connect.sid"); // If using session-based authentication
    res.clearCookie("token"); // If storing JWT in a cookie

    // Instead of redirecting, send a success response
    res.status(200).json({ message: "Logged out successfully" });
  });
};






module.exports = {
  registerUser,
  verifyUser,
  loginUser,
  forgotPassword,
  resetPassword,
  auth0Login,
  logoutUser,
};




// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");
// const Razorpay = require("razorpay");

// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });
//   res.status(200).json({ user });
// });

// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });
//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;
//   const updatedUser = await user.save();
//   res.status(200).json({
//     user: {
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isVerified: updatedUser.isVerified,
//       knownLanguages: updatedUser.knownLanguages,
//       learnLanguages: updatedUser.learnLanguages,
//     },
//   });
// });

// const logout = asyncHandler(async (req, res) => {
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite: isProduction ? 'none' : 'lax',
//     path: '/',
//     expires: new Date(0),
//   };
//   res.clearCookie("token", cookieOptions);
//   console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
//   res.status(200).json({ message: "Logged out successfully" });
// });

// const createPaymentOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     console.log("Razorpay key_id:", process.env.RAZORPAY_KEY_ID);
//     console.log("Razorpay key_secret:", process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set");

//     const timestamp = Date.now().toString().slice(-6);
//     const shortUserId = user._id.toString().slice(0, 12);
//     const receipt = `rcpt_${shortUserId}_${timestamp}`;

//     const options = {
//       amount: 50000, // ₹500 in paise
//       currency: "INR",
//       receipt: receipt,
//     };

//     console.log("Creating order with options:", options);
//     const order = await razorpay.orders.create(options);
//     console.log("Order created:", order);

//     res.status(200).json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (error) {
//     console.error("Payment order creation error:", {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       status: error.status,
//       raw: error,
//     });
//     res.status(500).json({ error: "Failed to create payment order", details: error.message });
//   }
// };

// const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ error: "Missing required payment fields" });
//     }

//     const crypto = require('crypto');
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     console.log("Generated Signature:", generatedSignature);
//     console.log("Received Signature:", razorpay_signature);

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     user.premium = true;
//     await user.save();
//     res.status(200).json({ message: "Premium plan activated" });
//   } catch (error) {
//     console.error("Payment verification error:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ error: "Failed to verify payment", details: error.message });
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
//     const users = await User.find({}, 'name email isOnline knownLanguages learnLanguages');
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Get all users error:", error.stack);
//     res.status(500).json({ error: "Failed to fetch users", details: error.message });
//   }
// };

// const sendEmailToUser = async (req, res) => {
//   try {
//     const { recipientId, message } = req.body;
//     const sender = req.user;
//     if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
//     if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

//     const recipient = await User.findById(recipientId);
//     if (!recipient) return res.status(404).json({ error: "Recipient not found" });

//     const mailOptions = {
//       from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
//       to: recipient.email,
//       subject: "Message from Language Exchange User",
//       text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
//     };

//     const transporter = require('../services/emailService').transporter;
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Send email error:", error.stack);
//     res.status(500).json({ error: "Failed to send email", details: error.message });
//   }
// };

// module.exports = {
//   getProfile,
//   updateProfile,
//   logout,
//   createPaymentOrder,
//   verifyPayment,
//   getAllUsers,
//   sendEmailToUser,
// };



// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");

// const Razorpay = require('razorpay');

// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });

//   res.status(200).json({ user });
// });

// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;

//   const updatedUser = await user.save();
//   res.status(200).json({
//     user: {
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isVerified: updatedUser.isVerified,
//       knownLanguages: updatedUser.knownLanguages,
//       learnLanguages: updatedUser.learnLanguages,
//     },
//   });
// });

// const logout = asyncHandler(async (req, res) => {
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction, // true in production
//     sameSite: isProduction ? 'none' : 'lax', // 'none' in production
//     path: '/',
//     expires: new Date(0), // Expire immediately
//   };
//   res.clearCookie("token", cookieOptions);
//   console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
//   res.status(200).json({ message: "Logged out successfully" });
// });


// module.exports = { getProfile, updateProfile, logout };



// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");
// const { sendVerificationEmail } = require('../services/emailService');
// const Razorpay = require("razorpay");

// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });

//   res.status(200).json({ user });
// });

// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;

//   const updatedUser = await user.save();
//   res.status(200).json({
//     user: {
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isVerified: updatedUser.isVerified,
//       knownLanguages: updatedUser.knownLanguages,
//       learnLanguages: updatedUser.learnLanguages,
//     },
//   });
// });

// const logout = asyncHandler(async (req, res) => {
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite: isProduction ? 'none' : 'lax',
//     path: '/',
//     expires: new Date(0),
//   };
//   res.clearCookie("token", cookieOptions);
//   console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
//   res.status(200).json({ message: "Logged out successfully" });
// });

// const createPaymentOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     console.log("Razorpay key_id:", process.env.RAZORPAY_KEY_ID);
//     console.log("Razorpay key_secret:", process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set");

//     const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
//     const shortUserId = user._id.toString().slice(0, 12); // First 12 chars of user._id
//     const receipt = `rcpt_${shortUserId}_${timestamp}`; // e.g., "rcpt_67c31e20f6ab_834167"

//     const options = {
//       amount: 50000, // ₹500 in paise
//       currency: "INR",
//       receipt: receipt,
//     };

//     console.log("Creating order with options:", options);
//     const order = await razorpay.orders.create(options);
//     console.log("Order created:", order);

//     res.status(200).json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (error) {
//     console.error("Payment order creation error:", {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       status: error.status,
//       raw: error,
//     });
//     res.status(500).json({ error: "Failed to create payment order", details: error.message });
//   }
// };
// const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ error: "Missing required payment fields" });
//     }

//     const crypto = require('crypto');
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     console.log("Generated Signature:", generatedSignature);
//     console.log("Received Signature:", razorpay_signature);

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     user.premium = true;
//     await user.save();
//     res.status(200).json({ message: "Premium plan activated" });
//   } catch (error) {
//     console.error("Payment verification error:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ error: "Failed to verify payment", details: error.message });
//   }
// };
// const getAllUsers = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });

//     const users = await User.find({}, 'name email isOnline knownLanguages learnLanguages');
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Get all users error:", error.stack);
//     res.status(500).json({ error: "Failed to fetch users", details: error.message });
//   }
// };

// const sendEmailToUser = async (req, res) => {
//   try {
//     const { recipientId, message } = req.body;
//     const sender = req.user;
//     if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
//     if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

//     const recipient = await User.findById(recipientId);
//     if (!recipient) return res.status(404).json({ error: "Recipient not found" });

//     const mailOptions = {
//       from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
//       to: recipient.email,
//       subject: "Message from Language Exchange User",
//       text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
//     };

//     const transporter = require('../services/emailService').transporter;
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Send email error:", error.stack);
//     res.status(500).json({ error: "Failed to send email", details: error.message });
//   }
// };

// module.exports = {
//   getProfile,
//   updateProfile,
//   logout,
//   createPaymentOrder,
//   verifyPayment,
//   getAllUsers,
//   sendEmailToUser
// };


// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");
// const Razorpay = require("razorpay");

// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });
//   res.status(200).json({ user });
// });

// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });
//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;
//   const updatedUser = await user.save();
//   res.status(200).json({
//     user: {
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isVerified: updatedUser.isVerified,
//       knownLanguages: updatedUser.knownLanguages,
//       learnLanguages: updatedUser.learnLanguages,
//     },
//   });
// });

// const logout = asyncHandler(async (req, res) => {
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite: isProduction ? 'none' : 'lax',
//     path: '/',
//     expires: new Date(0),
//   };
//   res.clearCookie("token", cookieOptions);
//   console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
//   res.status(200).json({ message: "Logged out successfully" });
// });

// const createPaymentOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     const razorpay = new Razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });

//     console.log("Razorpay key_id:", process.env.RAZORPAY_KEY_ID);
//     console.log("Razorpay key_secret:", process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set");

//     const timestamp = Date.now().toString().slice(-6);
//     const shortUserId = user._id.toString().slice(0, 12);
//     const receipt = `rcpt_${shortUserId}_${timestamp}`;

//     const options = {
//       amount: 50000, // ₹500 in paise
//       currency: "INR",
//       receipt: receipt,
//     };

//     console.log("Creating order with options:", options);
//     const order = await razorpay.orders.create(options);
//     console.log("Order created:", order);

//     res.status(200).json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//     });
//   } catch (error) {
//     console.error("Payment order creation error:", {
//       message: error.message,
//       stack: error.stack,
//       code: error.code,
//       status: error.status,
//       raw: error,
//     });
//     res.status(500).json({ error: "Failed to create payment order", details: error.message });
//   }
// };

// const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ error: "Missing required payment fields" });
//     }

//     const crypto = require('crypto');
//     const generatedSignature = crypto
//       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest('hex');

//     console.log("Generated Signature:", generatedSignature);
//     console.log("Received Signature:", razorpay_signature);

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ error: "Invalid payment signature" });
//     }

//     user.premium = true;
//     await user.save();
//     res.status(200).json({ message: "Premium plan activated" });
//   } catch (error) {
//     console.error("Payment verification error:", {
//       message: error.message,
//       stack: error.stack,
//     });
//     res.status(500).json({ error: "Failed to verify payment", details: error.message });
//   }
// };

// const getAllUsers = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
//     const users = await User.find({}, 'name email isOnline knownLanguages learnLanguages');
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Get all users error:", error.stack);
//     res.status(500).json({ error: "Failed to fetch users", details: error.message });
//   }
// };

// const sendEmailToUser = async (req, res) => {
//   try {
//     const { recipientId, message } = req.body;
//     const sender = req.user;
//     if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
//     if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

//     const recipient = await User.findById(recipientId);
//     if (!recipient) return res.status(404).json({ error: "Recipient not found" });

//     const mailOptions = {
//       from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
//       to: recipient.email,
//       subject: "Message from Language Exchange User",
//       text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
//     };

//     const transporter = require('../services/emailService').transporter;
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Send email error:", error.stack);
//     res.status(500).json({ error: "Failed to send email", details: error.message });
//   }
// };

// module.exports = {
//   getProfile,
//   updateProfile,
//   logout,
//   createPaymentOrder,
//   verifyPayment,
//   getAllUsers,
//   sendEmailToUser,
// };



const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Razorpay = require("razorpay");

// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });
//   res.status(200).json({ user });
// });


const getProfile = asyncHandler(async (req, res) => {
  console.log('getProfile route hit'); // Confirm route is reached
  const userId = req.params.userId || req.user.id; // Use userId from params if provided, else authenticated user
  console.log("Request params:", req.params);
  console.log("Fetching profile for userId:", userId);
  const user = await User.findById(userId).select("-password");
  if (!user) {
    console.log(`User not found for ID: ${userId}`);
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ user });
});
// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });
//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;
//   const updatedUser = await user.save();
//   res.status(200).json({
//     user: {
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isVerified: updatedUser.isVerified,
//       knownLanguages: updatedUser.knownLanguages,
//       learnLanguages: updatedUser.learnLanguages,
//     },
//   });
// });
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { name, knownLanguages, learnLanguages } = req.body;
  if (name && typeof name === 'string' && name.trim().length > 0) {
    user.name = name.trim();
  }
  if (knownLanguages && Array.isArray(knownLanguages)) {
    user.knownLanguages = knownLanguages.filter(lang => typeof lang === 'string' && lang.trim().length > 0);
  }
  if (learnLanguages && Array.isArray(learnLanguages)) {
    user.learnLanguages = learnLanguages.filter(lang => typeof lang === 'string' && lang.trim().length > 0);
  }
  const updatedUser = await user.save();
  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    isVerified: updatedUser.isVerified,
    knownLanguages: updatedUser.knownLanguages,
    learnLanguages: updatedUser.learnLanguages,
  });
});
const logout = asyncHandler(async (req, res) => {
  const user = req.user;
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    expires: new Date(0),
  };
  res.clearCookie("token", cookieOptions);

  if (user) {
    user.isOnline = false;
    await user.save();
    const io = require('../socket').getIO();
    io.to(user._id.toString()).emit('online-status', { status: 'offline' });
    console.log(`User ${user._id} set to offline on logout`);
  }

  console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

const createPaymentOrder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "User not authenticated" });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log("Razorpay key_id:", process.env.RAZORPAY_KEY_ID);
    console.log("Razorpay key_secret:", process.env.RAZORPAY_KEY_SECRET ? "Set" : "Not set");

    const timestamp = Date.now().toString().slice(-6);
    const shortUserId = user._id.toString().slice(0, 12);
    const receipt = `rcpt_${shortUserId}_${timestamp}`;

    const options = {
      amount: 50000, // ₹500 in paise
      currency: "INR",
      receipt: receipt,
    };

    console.log("Creating order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Order created:", order);

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Payment order creation error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      status: error.status,
      raw: error,
    });
    res.status(500).json({ error: "Failed to create payment order", details: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "User not authenticated" });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const crypto = require('crypto');
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log("Generated Signature:", generatedSignature);
    console.log("Received Signature:", razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    user.premium = true;
    await user.save();
    res.status(200).json({ message: "Premium plan activated" });
  } catch (error) {
    console.error("Payment verification error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to verify payment", details: error.message });
  }
};

// const getAllUsers = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
//     const users = await User.find({}, 'name email isOnline knownLanguages learnLanguages');
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Get all users error:", error.stack);
//     res.status(500).json({ error: "Failed to fetch users", details: error.message });
//   }
// };
const getAllUsers = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
    console.log('Fetching all users except:', user._id);
    const users = await User.find(
      { _id: { $ne: user._id } },
      'name email isOnline knownLanguages learnLanguages'
    );
    console.log('Users fetched:', users.map(u => u._id.toString()));
    res.status(200).json({ users });
  } catch (error) {
    console.error("Get all users error:", error.stack);
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};

// const sendEmailToUser = async (req, res) => {
//   try {
//     const { recipientId, message } = req.body;
//     const sender = req.user;
//     if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
//     if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

//     const recipient = await User.findById(recipientId);
//     if (!recipient) return res.status(404).json({ error: "Recipient not found" });

//     const mailOptions = {
//       from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
//       to: recipient.email,
//       subject: "Message from Language Exchange User",
//       text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
//     };

//     const transporter = require('../services/emailService').transporter;
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Send email error:", error.stack);
//     res.status(500).json({ error: "Failed to send email", details: error.message });
//   }
// };
const sendEmailToUser = async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const sender = req.user;
    if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
    if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

    const recipient = await User.findById(recipientId);
    if (!recipient) return res.status(404).json({ error: "Recipient not found" });

    const mailOptions = {
      from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
      to: recipient.email,
      subject: "Message from Language Exchange User",
      text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
    };

    const { transporter } = require('../services/emailService');
    console.log('Sending email with options:', mailOptions);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient.email} from ${sender.email}`);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Send email error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  logout,
  createPaymentOrder,
  verifyPayment,
  getAllUsers,
  sendEmailToUser,
};
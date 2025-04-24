// const User = require("../models/userModel");

// // Get user profile
// const getProfile = async (req, res) => {
//     console.log("In profile");
//     try {
//         const user = await User.findById(req.user.id).select("-password");
//         if (!user) return res.status(404).json({ message: "User not found" });

//         res.status(200).json({ user });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

// // Logout (clear cookie)
// const logout = (req, res) => {
//     res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
//     res.status(200).json({ message: "Logged out successfully" });
// };

// module.exports = { getProfile, logout };


// const asyncHandler = require("express-async-handler"); // Assuming you use this
// const User = require("../models/userModel");

// // Get user profile
// const getProfile = asyncHandler(async (req, res) => {
//   console.log("In profile");
//   const user = await User.findById(req.user.id).select("-password");
//   if (!user) return res.status(404).json({ message: "User not found" });

//   res.status(200).json({ user });
// });

// // Update user profile
// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   // Fields that can be updated
//   const { name, knownLanguages, learnLanguages } = req.body;

//   // Update only provided fields
//   if (name) user.name = name;
//   if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
//   if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;

//   // Save updated user
//   const updatedUser = await user.save();

//   // Return updated profile without password
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

// // Logout (clear cookie)
// // const logout = asyncHandler(async (req, res) => {
// //   res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
// //   res.status(200).json({ message: "Logged out successfully" });
// // });
// const logout = asyncHandler(async (req, res) => {
//   res.cookie("token", "", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // Match login settings
//     sameSite: "lax", // Match login settings
//     path: '/', // Ensure cookie is cleared site-wide
//     expires: new Date(0), // Immediately expire
//   });
//   console.log('Logout - Cookie cleared'); // Debug
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



// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");
// const Razorpay = require("razorpay");
// const { sendEmailService } = require('../services/emailService');

// const getProfile = asyncHandler(async (req, res) => {
//   console.log('getProfile route hit'); // Confirm route is reached
//   const userId = req.params.userId || req.user.id; // Use userId from params if provided, else authenticated user
//   console.log("Request params:", req.params);
//   console.log("Fetching profile for userId:", userId);
//   const user = await User.findById(userId).select("-password");
//   if (!user) {
//     console.log(`User not found for ID: ${userId}`);
//     return res.status(404).json({ message: "User not found" });
//   }
//   res.status(200).json({ user });
// });

// const updateProfile = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }
//   const { name, knownLanguages, learnLanguages } = req.body;
//   if (name && typeof name === 'string' && name.trim().length > 0) {
//     user.name = name.trim();
//   }
//   if (knownLanguages && Array.isArray(knownLanguages)) {
//     user.knownLanguages = knownLanguages.filter(lang => typeof lang === 'string' && lang.trim().length > 0);
//   }
//   if (learnLanguages && Array.isArray(learnLanguages)) {
//     user.learnLanguages = learnLanguages.filter(lang => typeof lang === 'string' && lang.trim().length > 0);
//   }
//   const updatedUser = await user.save();
//   res.status(200).json({
//     _id: updatedUser._id,
//     name: updatedUser.name,
//     email: updatedUser.email,
//     isVerified: updatedUser.isVerified,
//     knownLanguages: updatedUser.knownLanguages,
//     learnLanguages: updatedUser.learnLanguages,
//   });
// });
// const logout = asyncHandler(async (req, res) => {
//   const user = req.user;
//   const isProduction = process.env.NODE_ENV === 'production';
//   const cookieOptions = {
//     httpOnly: true,
//     secure: isProduction,
//     sameSite: isProduction ? 'none' : 'lax',
//     path: '/',
//     expires: new Date(0),
//   };
//   res.clearCookie("token", cookieOptions);

//   if (user) {
//     user.isOnline = false;
//     await user.save();
//     const io = require('../socket').getIO();
//     io.to(user._id.toString()).emit('online-status', { status: 'offline' });
//     console.log(`User ${user._id} set to offline on logout`);
//   }

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

// // const getAllUsers = async (req, res) => {
// //   try {
// //     const user = req.user;
// //     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
// //     const users = await User.find({}, 'name email isOnline knownLanguages learnLanguages');
// //     res.status(200).json({ users });
// //   } catch (error) {
// //     console.error("Get all users error:", error.stack);
// //     res.status(500).json({ error: "Failed to fetch users", details: error.message });
// //   }
// // };
// const getAllUsers = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user || !user.premium) return res.status(403).json({ error: "Premium access required" });
//     console.log('Fetching all users except:', user._id);
//     const users = await User.find(
//       { _id: { $ne: user._id } },
//       'name email isOnline knownLanguages learnLanguages'
//     );
//     console.log('Users fetched:', users.map(u => u._id.toString()));
//     res.status(200).json({ users });
//   } catch (error) {
//     console.error("Get all users error:", error.stack);
//     res.status(500).json({ error: "Failed to fetch users", details: error.message });
//   }
// };

// // const sendEmailToUser = async (req, res) => {
// //   try {
// //     const { recipientId, message } = req.body;
// //     const sender = req.user;
// //     if (!sender || !sender.premium) return res.status(403).json({ error: "Premium access required" });
// //     if (!recipientId || !message) return res.status(400).json({ error: "Recipient ID and message required" });

// //     const recipient = await User.findById(recipientId);
// //     if (!recipient) return res.status(404).json({ error: "Recipient not found" });

// //     const mailOptions = {
// //       from: `"${sender.name} via Language Exchange" <${process.env.EMAIL}>`,
// //       to: recipient.email,
// //       subject: "Message from Language Exchange User",
// //       text: `From: ${sender.name} (${sender.email})\n\nMessage: ${message}`,
// //     };

// //     const { transporter } = require('../services/emailService');
// //     console.log('Sending email with options:', mailOptions);
// //     await transporter.sendMail(mailOptions);
// //     console.log(`Email sent to ${recipient.email} from ${sender.email}`);
// //     res.status(200).json({ message: "Email sent successfully" });
// //   } catch (error) {
// //     console.error("Send email error:", {
// //       message: error.message,
// //       stack: error.stack,
// //       code: error.code,
// //     });
// //     res.status(500).json({ error: "Failed to send email", details: error.message });
// //   }
// // };
// const sendEmailToUser = asyncHandler(async (req, res) => {
//   const { recipientId, subject, message } = req.body;
//   const sender = req.user;

//   if (!recipientId || !subject || !message) {
//     res.status(400);
//     throw new Error('Recipient ID, subject, and message are required');
//   }

//   const recipient = await User.findById(recipientId);
//   if (!recipient) {
//     res.status(404);
//     throw new Error('Recipient not found');
//   }

//   if (!sender.premium) {
//     res.status(403);
//     throw new Error('Premium account required to send emails');
//   }

//   try {
//     await sendEmailService({
//       to: recipient.email,
//       subject: `Message from ${sender.name}: ${subject}`,
//       text: `You have received a message from ${sender.name} (${sender.email}):\n\n${message}`,
//       from: { name: sender.name, email: sender.email }, // Pass sender's name and email
//     });

//     res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     res.status(500);
//     throw new Error('Failed to send email');
//   }
// });

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
const { sendEmailService } = require('../services/emailService');

const getProfile = asyncHandler(async (req, res) => {
  console.log("In profile");
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, knownLanguages, learnLanguages } = req.body;
  if (name) user.name = name;
  if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
  if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;

  const updatedUser = await user.save();
  res.status(200).json({
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isVerified: updatedUser.isVerified,
      knownLanguages: updatedUser.knownLanguages,
      learnLanguages: updatedUser.learnLanguages,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // true in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' in production
    path: '/',
    expires: new Date(0), // Expire immediately
  };
  res.clearCookie("token", cookieOptions);
  console.log('Logout - NODE_ENV:', process.env.NODE_ENV, 'Cookie cleared with:', cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
});

const createPaymentOrder = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "User not authenticated" });

    const { type, amount } = req.body;
    if (!type || !amount) return res.status(400).json({ error: "Type and amount are required" });

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
      amount: amount, // Amount in paise
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
      type,
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
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ error: "User not authenticated" });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !type) {
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

    if (type === 'premium') {
      user.premium = true;
      user.coinTokens = (user.coinTokens || 0) + 50; // Add 50 coins with premium
      await user.save();
      res.status(200).json({ message: "Premium plan activated with 50 Coins" });
    } else if (type === 'coinTokens') {
      user.coinTokens = (user.coinTokens || 0) + 10; // Add 10 coins for ₹50
      await user.save();
      res.status(200).json({ message: "Successfully purchased 10 Coins" });
    } else {
      return res.status(400).json({ error: "Invalid payment type" });
    }
  } catch (error) {
    console.error("Payment verification error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Failed to verify payment", details: error.message });
  }
};

const exchangePowerTokens = asyncHandler(async (req, res) => {
  console.log('exchangePowerTokens endpoint hit');
  const user = req.user;
  if (!user) return res.status(401).json({ error: "User not authenticated" });

  const { coinTokens } = req.body;
  console.log('Exchange request:', { userId: user._id, coinTokens });
  if (!coinTokens || coinTokens !== 1) {
    return res.status(400).json({ error: "Exactly 1 Coin Token is required for exchange" });
  }

  if (user.coinTokens < 1) {
    return res.status(400).json({ error: "Insufficient Coin Tokens" });
  }

  user.coinTokens -= 1;
  user.powerTokens = (user.powerTokens || 0) + 2;
  await user.save();

  console.log(`Exchange successful for user ${user._id}: -1 CoinToken, +2 PowerTokens`);
  res.status(200).json({ message: "Successfully exchanged 1 Coin Token for 2 Power Tokens" });
});

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

const sendEmailToUser = asyncHandler(async (req, res) => {
  const { recipientId, subject, message } = req.body;
  const sender = req.user;

  if (!recipientId || !subject || !message) {
    res.status(400);
    throw new Error('Recipient ID, subject, and message are required');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    res.status(404);
    throw new Error('Recipient not found');
  }

  if (!sender.premium) {
    res.status(403);
    throw new Error('Premium account required to send emails');
  }

  try {
    await sendEmailService({
      to: recipient.email,
      subject: `Message from ${sender.name}: ${subject}`,
      text: `You have received a message from ${sender.name} (${sender.email}):\n\n${message}`,
      from: { name: sender.name, email: sender.email },
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to send email');
  }
});

module.exports = {
  getProfile,
  updateProfile,
  logout,
  createPaymentOrder,
  verifyPayment,
  exchangePowerTokens,
  getAllUsers,
  sendEmailToUser,
};

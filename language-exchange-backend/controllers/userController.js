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


const asyncHandler = require("express-async-handler"); // Assuming you use this
const User = require("../models/userModel");

// Get user profile
const getProfile = asyncHandler(async (req, res) => {
  console.log("In profile");
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ user });
});

// Update user profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // Fields that can be updated
  const { name, knownLanguages, learnLanguages } = req.body;

  // Update only provided fields
  if (name) user.name = name;
  if (knownLanguages && Array.isArray(knownLanguages)) user.knownLanguages = knownLanguages;
  if (learnLanguages && Array.isArray(learnLanguages)) user.learnLanguages = learnLanguages;

  // Save updated user
  const updatedUser = await user.save();

  // Return updated profile without password
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

// Logout (clear cookie)
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { getProfile, updateProfile, logout };
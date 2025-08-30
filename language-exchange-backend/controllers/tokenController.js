


const User = require("../models/userModel");

exports.generatePowerToken = async (req, res) => {
  try {
    const users = await User.find();
    // const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    const twoHours=120*1000;
    for (let user of users) {
      const timeDiff = Date.now() - new Date(user.lastTokenGeneration).getTime();
      if (timeDiff >= twoHours && user.powerTokens < 10) {
        user.powerTokens += 1;
        user.lastTokenGeneration = Date.now();
        await user.save();
      }
    }
    res.status(200).json({ message: "Power tokens generated" });
  } catch (error) {
    console.error("Generate power token error:", error);
    res.status(500).json({ error: error.message });
  }
};
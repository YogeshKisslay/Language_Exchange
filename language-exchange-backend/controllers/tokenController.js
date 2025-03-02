const User = require("../models/userModel"); // Match your middleware's import

exports.generatePowerToken = async (req, res) => {
  try {
    const users = await User.find();
    const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    // const twoHours=10*1000;
    for (let user of users) {
      const timeDiff = Date.now() - new Date(user.lastTokenGeneration).getTime();
      if (timeDiff >= twoHours && user.powerTokens < 10) {
        user.powerTokens += 1; // Only power tokens are auto-generated
        user.lastTokenGeneration = Date.now();
        await user.save();
      }
    }
    res.status(200).json({ message: "Power tokens generated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





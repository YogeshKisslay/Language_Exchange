const User = require("../models/userModel");

// Get user profile
const getProfile = async (req, res) => {
    console.log("In profile");
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Logout (clear cookie)
const logout = (req, res) => {
    res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { getProfile, logout };

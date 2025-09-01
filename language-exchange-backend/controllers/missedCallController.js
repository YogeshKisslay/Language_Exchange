const MissedCall = require("../models/missedCallModel");

// Get all pending missed calls for the logged-in user
exports.getMissedCalls = async (req, res) => {
  try {
    const userId = req.user._id;
    const missedCalls = await MissedCall.find({ intendedReceiver: userId, status: "pending" })
      .populate('caller', 'name isOnline') // <-- Populate caller's name AND current online status
      .sort({ createdAt: -1 });

    res.status(200).json({ missedCalls });
  } catch (error) {
    console.error("Get missed calls error:", error.stack);
    res.status(500).json({ error: "Failed to fetch missed calls", details: error.message });
  }
};

// Dismiss a missed call notification
exports.dismissMissedCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user._id;

    const missedCall = await MissedCall.findOneAndUpdate(
      { _id: callId, intendedReceiver: userId },
      { status: "dismissed" },
      { new: true }
    );

    if (!missedCall) {
      return res.status(404).json({ error: "Missed call not found or you are not authorized" });
    }

    res.status(200).json({ message: "Missed call dismissed" });
  } catch (error) {
    console.error("Dismiss missed call error:", error.stack);
    res.status(500).json({ error: "Failed to dismiss missed call", details: error.message });
  }
};
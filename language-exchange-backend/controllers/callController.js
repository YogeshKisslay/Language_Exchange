const User = require("../models/userModel"); // Match your middleware's import
const Call = require("../models/CallModel");

exports.initiateCall = async (req, res) => {
  try {
    const caller = req.user; // Use authenticated user from middleware
    const { language } = req.body; // Only language comes from body

    if (!caller || caller.powerTokens < 1) {
      return res.status(400).json({ error: "Insufficient power tokens or user not found" });
    }

    // Find potential receivers who know the language
    const receivers = await User.find({
      knownLanguages: language,
      _id: { $ne: caller._id } // Use caller's _id from req.user
    });

    if (receivers.length === 0) {
      return res.status(404).json({ error: "No available teachers found" });
    }

    caller.powerTokens -= 1; // Deduct power token on call initiation
    await caller.save();

    const call = new Call({
      caller: caller._id, // Use _id from req.user
      language,
      status: "pending"
    });

    await call.save();
    res.status(200).json({ callId: call._id, potentialReceivers: receivers.map(r => r._id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const receiver = req.user; // Use authenticated user as receiver

    const call = await Call.findById(callId);

    if (!call || call.status !== "pending") {
      return res.status(400).json({ error: "Invalid or already accepted call" });
    }

    call.receiver = receiver._id; // Use receiver's _id from req.user
    call.status = "active";
    await call.save();

    res.status(200).json({ message: "Call accepted", call });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await Call.findById(callId).populate("caller receiver");

    if (!call || call.status !== "active") {
      return res.status(400).json({ error: "Invalid call" });
    }

    call.endTime = Date.now();
    call.duration = (call.endTime - call.startTime) / 1000; // in seconds
    call.status = call.duration >= 120 ? "completed" : "disconnected";

    if (call.status === "completed") {
      call.receiver.coinTokens += 1; // Award coin token only on 2+ min completion
      await call.receiver.save();
    }

    await call.save();
    res.status(200).json({ message: "Call ended", call });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.extendCall = async (req, res) => {
  try {
    const { callId, extend } = req.body;
    const call = await Call.findById(callId).populate("caller receiver");

    if (!call || call.status !== "active" || call.duration < 120) {
      return res.status(400).json({ error: "Cannot extend call" });
    }

    if (extend && call.caller.powerTokens >= 1) {
      call.caller.powerTokens -= 1; // Deduct power token for extension
      call.extended = true;
      call.receiver.coinTokens += 1; // Award coin token for extension
      await call.caller.save();
      await call.receiver.save();
      await call.save();
      res.status(200).json({ message: "Call extended" });
    } else {
      await exports.endCall({ body: { callId } }, res);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



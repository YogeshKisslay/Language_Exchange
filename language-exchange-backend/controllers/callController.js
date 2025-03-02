// const User = require("../models/userModel"); // Match your middleware's import
// const Call = require("../models/callModel");

// exports.initiateCall = async (req, res) => {
//   try {
//     const caller = req.user; // Use authenticated user from middleware
//     const { language } = req.body; // Only language comes from body

//     if (!caller || caller.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens or user not found" });
//     }

//     // Find potential receivers who know the language
//     const receivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id } // Use caller's _id from req.user
//     });

//     if (receivers.length === 0) {
//       return res.status(404).json({ error: "No available teachers found" });
//     }

//     caller.powerTokens -= 1; // Deduct power token on call initiation
//     await caller.save();

//     const call = new Call({
//       caller: caller._id, // Use _id from req.user
//       language,
//       status: "pending"
//     });

//     await call.save();
//     res.status(200).json({ callId: call._id, potentialReceivers: receivers.map(r => r._id) });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.acceptCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const receiver = req.user; // Use authenticated user as receiver

//     const call = await Call.findById(callId);

//     if (!call || call.status !== "pending") {
//       return res.status(400).json({ error: "Invalid or already accepted call" });
//     }

//     call.receiver = receiver._id; // Use receiver's _id from req.user
//     call.status = "active";
//     await call.save();

//     res.status(200).json({ message: "Call accepted", call });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.endCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active") {
//       return res.status(400).json({ error: "Invalid call" });
//     }

//     call.endTime = Date.now();
//     call.duration = (call.endTime - call.startTime) / 1000; // in seconds
//     call.status = call.duration >= 120 ? "completed" : "disconnected";

//     if (call.status === "completed") {
//       call.receiver.coinTokens += 1; // Award coin token only on 2+ min completion
//       await call.receiver.save();
//     }

//     await call.save();
//     res.status(200).json({ message: "Call ended", call });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.extendCall = async (req, res) => {
//   try {
//     const { callId, extend } = req.body;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active" || call.duration < 120) {
//       return res.status(400).json({ error: "Cannot extend call" });
//     }

//     if (extend && call.caller.powerTokens >= 1) {
//       call.caller.powerTokens -= 1; // Deduct power token for extension
//       call.extended = true;
//       call.receiver.coinTokens += 1; // Award coin token for extension
//       await call.caller.save();
//       await call.receiver.save();
//       await call.save();
//       res.status(200).json({ message: "Call extended" });
//     } else {
//       await exports.endCall({ body: { callId } }, res);
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };





// APIIIIIIIIIIIIIIII

// const User = require("../models/userModel");
// const Call = require("../models/callModel");

// exports.initiateCall = async (req, res) => {
//   try {
//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller || caller.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens or user not found" });
//     }

//     const potentialReceivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id },
//       isOnline: true
//     });

//     if (potentialReceivers.length === 0) {
//       return res.status(404).json({ error: "No available teachers found" });
//     }

//     const call = new Call({
//       caller: caller._id,
//       language,
//       potentialReceivers: potentialReceivers.map((r) => r._id),
//       status: "pending"
//     });

//     await call.save();
//     console.log(`Call ${call._id} initiated by ${caller.name} for ${language}`);
//     res.status(200).json({
//       callId: call._id,
//       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
//     });
//   } catch (error) {
//     console.error("Initiate call error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };
// exports.acceptCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const receiver = req.user;

//     const call = await Call.findById(callId).populate("caller");

//     if (!call || call.status !== "pending" || !call.potentialReceivers.includes(receiver._id)) {
//       return res.status(400).json({ error: "Invalid or unavailable call" });
//     }

//     const caller = call.caller;
//     if (caller.powerTokens < 1) {
//       call.status = "cancelled";
//       await call.save();
//       return res.status(400).json({ error: "Caller has insufficient power tokens" });
//     }

//     caller.powerTokens -= 1;
//     await caller.save();

//     call.receiver = receiver._id;
//     call.potentialReceivers = [];
//     call.status = "active";
//     await call.save();

//     console.log(`Call ${callId} accepted by ${receiver.name}`);
//     res.status(200).json({ message: "Call accepted", call });
//   } catch (error) {
//     console.error("Accept call error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.endCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active") {
//       return res.status(400).json({ error: "Invalid call" });
//     }

//     call.endTime = Date.now();
//     call.duration = (call.endTime - call.startTime) / 1000;
//     call.status = call.duration >= 120 ? "completed" : "disconnected";

//     if (call.status === "completed") {
//       call.receiver.coinTokens += 1;
//       await call.receiver.save();
//     }

//     await call.save();
//     console.log(`Call ${callId} ended with status: ${call.status}`);
//     res.status(200).json({ message: "Call ended", call });
//   } catch (error) {
//     console.error("End call error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.extendCall = async (req, res) => {
//   try {
//     const { callId, extend } = req.body;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active" || call.duration < 120) {
//       return res.status(400).json({ error: "Cannot extend call" });
//     }

//     if (extend && call.caller.powerTokens >= 1) {
//       call.caller.powerTokens -= 1;
//       call.extended = true;
//       call.receiver.coinTokens += 1;
//       await call.caller.save();
//       await call.receiver.save();
//       await call.save();
//       console.log(`Call ${callId} extended`);
//       res.status(200).json({ message: "Call extended" });
//     } else {
//       await exports.endCall({ body: { callId } }, res);
//     }
//   } catch (error) {
//     console.error("Extend call error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.cancelCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const caller = req.user;

//     const call = await Call.findById(callId);

//     if (!call || call.caller.toString() !== caller._id.toString() || call.status !== "pending") {
//       return res.status(400).json({ error: "Cannot cancel call" });
//     }

//     call.status = "cancelled";
//     await call.save();
//     console.log(`Call ${callId} cancelled by ${caller.name}`);
//     res.status(200).json({ message: "Call cancelled" });
//   } catch (error) {
//     console.error("Cancel call error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.setOnlineStatus = async (req, res) => {
//   try {
//     const { isOnline } = req.body;
//     const user = req.user;
//     user.isOnline = isOnline;
//     await user.save();
//     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
//     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
//   } catch (error) {
//     console.error("Set online status error:", error);
//     res.status(500).json({ error: error.message });
//   }
// };



const User = require("../models/userModel");
const Call = require("../models/callModel");
const socket = require("../socket");

exports.initiateCall = async (req, res) => {
  try {
    const caller = req.user;
    const { language } = req.body;

    if (!caller || caller.powerTokens < 1) {
      return res.status(400).json({ error: "Insufficient power tokens or user not found" });
    }

    const potentialReceivers = await User.find({
      knownLanguages: language,
      _id: { $ne: caller._id },
      isOnline: true
    });

    if (potentialReceivers.length === 0) {
      return res.status(404).json({ error: "No available teachers found" });
    }

    const call = new Call({
      caller: caller._id,
      language,
      potentialReceivers: potentialReceivers.map((r) => r._id),
      status: "pending"
    });

    await call.save();

    const io = socket.getIO(); // Fetch io here
    potentialReceivers.forEach((receiver) => {
      io.to(receiver._id.toString()).emit("call-request", {
        callId: call._id,
        callerId: caller._id,
        callerName: caller.name,
        language
      });
    });

    console.log(`Call ${call._id} initiated by ${caller.name} for ${language}`);
    res.status(200).json({
      callId: call._id,
      potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
    });
  } catch (error) {
    console.error("Initiate call error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const receiver = req.user;

    const call = await Call.findById(callId).populate("caller");

    if (!call || call.status !== "pending" || !call.potentialReceivers.includes(receiver._id)) {
      return res.status(400).json({ error: "Invalid or unavailable call" });
    }

    const caller = call.caller;
    if (caller.powerTokens < 1) {
      call.status = "cancelled";
      await call.save();
      return res.status(400).json({ error: "Caller has insufficient power tokens" });
    }

    caller.powerTokens -= 1;
    await caller.save();

    call.receiver = receiver._id;
    call.potentialReceivers = [];
    call.status = "active";
    await call.save();

    const io = socket.getIO(); // Fetch io here
    io.to(caller._id.toString()).emit("call-accepted", {
      callId,
      receiverId: receiver._id,
      receiverName: receiver.name
    });
    call.potentialReceivers.forEach((otherReceiverId) => {
      io.to(otherReceiverId.toString()).emit("call-cancelled", { callId });
    });

    console.log(`Call ${callId} accepted by ${receiver.name}`);
    res.status(200).json({ message: "Call accepted", call });
  } catch (error) {
    console.error("Accept call error:", error);
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
    call.duration = (call.endTime - call.startTime) / 1000;
    call.status = call.duration >= 120 ? "completed" : "disconnected";

    if (call.status === "completed") {
      call.receiver.coinTokens += 1;
      await call.receiver.save();
    }

    await call.save();

    const io = socket.getIO(); // Fetch io here
    io.to(call.caller._id.toString()).emit("call-ended", { callId, status: call.status });
    io.to(call.receiver._id.toString()).emit("call-ended", { callId, status: call.status });

    console.log(`Call ${callId} ended with status: ${call.status}`);
    res.status(200).json({ message: "Call ended", call });
  } catch (error) {
    console.error("End call error:", error);
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
      call.caller.powerTokens -= 1;
      call.extended = true;
      call.receiver.coinTokens += 1;
      await call.caller.save();
      await call.receiver.save();
      await call.save();

      const io = socket.getIO(); // Fetch io here
      io.to(call.caller._id.toString()).emit("call-extended", { callId });
      io.to(call.receiver._id.toString()).emit("call-extended", { callId });

      console.log(`Call ${callId} extended`);
      res.status(200).json({ message: "Call extended" });
    } else {
      await exports.endCall({ body: { callId } }, res);
    }
  } catch (error) {
    console.error("Extend call error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const caller = req.user;

    const call = await Call.findById(callId);

    if (!call || call.caller.toString() !== caller._id.toString() || call.status !== "pending") {
      return res.status(400).json({ error: "Cannot cancel call" });
    }

    call.status = "cancelled";
    await call.save();

    const io = socket.getIO(); // Fetch io here
    call.potentialReceivers.forEach((receiverId) => {
      io.to(receiverId.toString()).emit("call-cancelled", { callId });
    });

    console.log(`Call ${callId} cancelled by ${caller.name}`);
    res.status(200).json({ message: "Call cancelled" });
  } catch (error) {
    console.error("Cancel call error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.setOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;
    const user = req.user;
    user.isOnline = isOnline;
    await user.save();

    if (isOnline) {
      const io = socket.getIO(); // Fetch io here
      io.to(user._id.toString()).emit("online-status", { status: "online" });
    }

    console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
    res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
  } catch (error) {
    console.error("Set online status error:", error);
    res.status(500).json({ error: error.message });
  }
};
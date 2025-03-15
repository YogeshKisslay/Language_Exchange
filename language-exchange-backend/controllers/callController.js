


// const User = require("../models/userModel");
// const Call = require("../models/callModel");
// const socket = require("../socket");

// exports.initiateCall = async (req, res) => {
//   try {
//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     if (!language) {
//       return res.status(400).json({ error: "Language is required" });
//     }
//     if (caller.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens" });
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

//     const io = socket.getIO();
//     potentialReceivers.forEach((receiver) => {
//       io.to(receiver._id.toString()).emit("call-request", {
//         callId: call._id,
//         callerId: caller._id,
//         callerName: caller.name,
//         language
//       });
//     });

//     console.log(`Call ${call._id} initiated by ${caller.name} for ${language}`);
//     res.status(200).json({
//       callId: call._id,
//       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
//     });
//   } catch (error) {
//     console.error("Initiate call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to initiate call", details: error.message });
//   }
// };

// exports.acceptCall = async (req, res) => {
//   const { callId } = req.body;
//   const userId = req.user._id;

//   const call = await Call.findById(callId);
//   if (!call || call.status !== "pending" || !call.potentialReceivers.includes(userId)) {
//     return res.status(400).json({ message: "Invalid call or not a receiver" });
//   }

//   call.receiver = userId;
//   call.status = "active";
//   call.startTime = new Date();
//   call.potentialReceivers = [];
//   await call.save();

//   const caller = await User.findById(call.caller);
//   caller.powerTokens -= 1;
//   await caller.save();

//   const io = req.app.get("io"); // Assuming you set io in app
//   io.to(call.caller.toString()).emit("call-accepted", {
//     callId,
//     receiverId: userId,
//     receiverName: req.user.name,
//   });
//   call.potentialReceivers.forEach((receiverId) => {
//     io.to(receiverId.toString()).emit("call-cancelled", { callId });
//   });

//   res.json({ message: "Call accepted", call });
// };
// exports.extendCall = async (req, res) => {
//   try {
//     const { callId, extend } = req.body;
//     const requester = req.user;

//     if (!requester) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     if (!callId) {
//       return res.status(400).json({ error: "Call ID is required" });
//     }
//     if (typeof extend !== 'boolean') {
//       return res.status(400).json({ error: "Extend must be a boolean" });
//     }

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call) {
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "active") {
//       return res.status(400).json({ error: `Call is not active, current status: ${call.status}` });
//     }
//     if (!call.startTime) {
//       return res.status(400).json({ error: "Call start time not set" });
//     }

//     const duration = (Date.now() - call.startTime) / 1000;
//     console.log(`Call ${callId} duration: ${duration.toFixed(0)} seconds`);
//     if (duration < 5) {
//       return res.status(400).json({ 
//         error: `Cannot extend call yet, duration is ${duration.toFixed(0)} seconds (minimum 120 seconds required)` 
//       });
//     }

//     const otherUserId = call.caller._id.toString() === requester._id.toString() ? call.receiver._id : call.caller._id;
//     const io = socket.getIO();

//     if (extend) {
//       if (call.caller.powerTokens < 1) {
//         return res.status(400).json({ error: "Caller has insufficient power tokens" });
//       }
//       io.to(otherUserId.toString()).emit("extend-request", {
//         callId,
//         requesterId: requester._id,
//         requesterName: requester.name
//       });
//       console.log(`Call ${callId} extension requested by ${requester.name}, awaiting approval from ${call.caller._id.toString() === requester._id.toString() ? call.receiver.name : call.caller.name}`);
//       res.status(200).json({ message: "Extension request sent, awaiting approval" });
//     } else {
//       await exports.endCall({ body: { callId } }, res);
//     }
//   } catch (error) {
//     console.error("Extend call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to extend call", details: error.message });
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

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-ended", { callId, status: call.status });
//     io.to(call.receiver._id.toString()).emit("call-ended", { callId, status: call.status });

//     console.log(`Call ${callId} ended with status: ${call.status}`);
//     res.status(200).json({ message: "Call ended", call });
//   } catch (error) {
//     console.error("End call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to end call", details: error.message });
//   }
// };

// exports.approveExtendCall = async (req, res) => {
//   try {
//     const { callId, approve } = req.body;
//     const approver = req.user;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active" || (call.caller._id.toString() !== approver._id.toString() && call.receiver._id.toString() !== approver._id.toString())) {
//       return res.status(400).json({ error: "Invalid call or user" });
//     }

//     const io = socket.getIO();
//     if (approve && call.caller.powerTokens >= 1) {
//       call.caller.powerTokens -= 1;
//       call.extended = true;
//       call.receiver.coinTokens += 1;
//       await call.caller.save();
//       await call.receiver.save();
//       await call.save();

//       io.to(call.caller._id.toString()).emit("call-extended", { callId });
//       io.to(call.receiver._id.toString()).emit("call-extended", { callId });

//       console.log(`Call ${callId} extended after approval by ${approver.name}`);
//       res.status(200).json({ message: "Call extended" });
//     } else {
//       io.to(call.caller._id.toString()).emit("extend-denied", { callId });
//       io.to(call.receiver._id.toString()).emit("extend-denied", { callId });
//       console.log(`Call ${callId} extension denied by ${approver.name}`);
//       res.status(200).json({ message: "Extension denied" });
//     }
//   } catch (error) {
//     console.error("Approve extend call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to approve extend call", details: error.message });
//   }
// };

// exports.rejectCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const receiver = req.user;

//     const call = await Call.findById(callId).populate("caller");
//     if (!call || call.status !== "pending" || !call.potentialReceivers.includes(receiver._id)) {
//       return res.status(400).json({ error: "Invalid or unavailable call" });
//     }

//     call.potentialReceivers = call.potentialReceivers.filter(
//       (id) => id.toString() !== receiver._id.toString()
//     );

//     if (call.potentialReceivers.length === 0) {
//       call.status = "cancelled";
//     }
//     await call.save();

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-rejected", {
//       callId,
//       receiverId: receiver._id,
//       receiverName: receiver.name
//     });

//     console.log(`Call ${callId} rejected by ${receiver.name}`);
//     res.status(200).json({ message: "Call rejected" });
//   } catch (error) {
//     console.error("Reject call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to reject call", details: error.message });
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

//     const io = socket.getIO();
//     call.potentialReceivers.forEach((receiverId) => {
//       io.to(receiverId.toString()).emit("call-cancelled", { callId });
//     });

//     console.log(`Call ${callId} cancelled by ${caller.name}`);
//     res.status(200).json({ message: "Call cancelled" });
//   } catch (error) {
//     console.error("Cancel call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to cancel call", details: error.message });
//   }
// };

// exports.setOnlineStatus = async (req, res) => {
//   try {
//     const { isOnline } = req.body;
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ error: "User not authenticated" });
//     }
//     if (typeof isOnline !== 'boolean') {
//       return res.status(400).json({ error: "isOnline must be a boolean" });
//     }

//     user.isOnline = isOnline;
//     await user.save();

//     if (isOnline) {
//       const io = socket.getIO();
//       io.to(user._id.toString()).emit("online-status", { status: "online" });
//     }

//     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
//     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
//   } catch (error) {
//     console.error("Set online status error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to set online status", details: error.message });
//   }
// };

// exports.getCurrentCall = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const currentCall = await Call.findOne({
//       $or: [
//         { caller: userId, status: { $in: ['pending', 'active'] } },
//         { receiver: userId, status: 'active' },
//         { potentialReceivers: userId, status: 'pending' }
//       ]
//     }).populate('caller receiver', 'name');

//     if (!currentCall) {
//       return res.json({ call: null });
//     }

//     const callData = {
//       callId: currentCall._id,
//       status: currentCall.status,
//       language: currentCall.language,
//       callerId: currentCall.caller._id.toString(),
//       caller: currentCall.caller.name,
//     };
//     if (currentCall.status === 'pending' && currentCall.caller.toString() === userId.toString()) {
//       callData.receivers = currentCall.potentialReceivers.map(id => ({ id: id.toString() }));
//     } else if (currentCall.status === 'pending' && currentCall.potentialReceivers.includes(userId)) {
//       callData.caller = currentCall.caller.name;
//     } else if (currentCall.status === 'active') {
//       callData.receiver = currentCall.receiver?.name;
//       callData.extended = currentCall.extended;
//     }

//     console.log('getCurrentCall - Returning:', callData);
//     res.json({ call: callData });
//   } catch (error) {
//     console.error("Get current call error:", error.message, error.stack);
//     res.status(500).json({ error: "Failed to get current call", details: error.message });
//   }
// };

// module.exports = exports;


// const User = require("../models/userModel");
// const Call = require("../models/callModel");
// const socket = require("../socket");

// // exports.initiateCall = async (req, res) => {
// //   try {
// //     console.log('Initiate call - Request body:', req.body);
// //     console.log('Initiate call - User:', req.user);

// //     const caller = req.user;
// //     const { language } = req.body;

// //     if (!caller) return res.status(401).json({ error: "User not authenticated" });
// //     if (!caller._id) return res.status(400).json({ error: "User ID missing" });
// //     if (!language) return res.status(400).json({ error: "Language is required" });
// //     if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
// //       console.log(`Insufficient power tokens for ${caller.name}: ${caller.powerTokens}`);
// //       return res.status(400).json({ error: "Insufficient power tokens" });
// //     }

// //     const potentialReceivers = await User.find({
// //       knownLanguages: language,
// //       _id: { $ne: caller._id },
// //       isOnline: true
// //     });
// //     console.log('Potential receivers:', potentialReceivers.map(r => r.name));

// //     if (potentialReceivers.length === 0) {
// //       return res.status(404).json({ error: "No available teachers found" });
// //     }

// //     const call = new Call({
// //       caller: caller._id,
// //       language,
// //       potentialReceivers: potentialReceivers.map((r) => r._id),
// //       status: "pending"
// //     });

// //     await call.save();
// //     console.log('Call saved:', call._id);

// //     const io = socket.getIO();
// //     potentialReceivers.forEach((receiver) => {
// //       io.to(receiver._id.toString()).emit("call-request", {
// //         callId: call._id,
// //         callerId: caller._id,
// //         callerName: caller.name,
// //         language
// //       });
// //       console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);
// //     });

// //     res.status(200).json({
// //       callId: call._id,
// //       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
// //     });
// //   } catch (error) {
// //     console.error("Initiate call error:", error.message);
// //     res.status(500).json({ error: "Failed to initiate call", details: error.message });
// //   }
// // };
// exports.initiateCall = async (req, res) => {
//   try {
//     console.log('Initiate call - Request body:', req.body);
//     console.log('Initiate call - User:', req.user);

//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller) return res.status(401).json({ error: "User not authenticated" });
//     if (!caller._id) return res.status(400).json({ error: "User ID missing" });
//     if (!language || typeof language !== 'string') {
//       console.log('Invalid language:', language);
//       return res.status(400).json({ error: "Language must be a string" });
//     }
//     if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
//       console.log(`Insufficient power tokens for ${caller.name}: ${caller.powerTokens}`);
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const potentialReceivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id },
//       isOnline: true
//     });
//     console.log('Potential receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

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
//     console.log('Call saved:', call._id);

//     const io = socket.getIO();
//     potentialReceivers.forEach((receiver) => {
//       io.to(receiver._id.toString()).emit("call-request", {
//         callId: call._id,
//         callerId: caller._id,
//         callerName: caller.name,
//         language
//       });
//       console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);
//     });

//     res.status(200).json({
//       callId: call._id,
//       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
//     });
//   } catch (error) {
//     console.error("Initiate call error:", error.message);
//     res.status(500).json({ error: "Failed to initiate call", details: error.message });
//   }
// };
// // exports.initiateCall = async (req, res) => {
// //   try {
// //     const caller = req.user;
// //     const { language } = req.body;

// //     if (!caller) return res.status(401).json({ error: "User not authenticated" });
// //     if (!language) return res.status(400).json({ error: "Language is required" });
// //     if (caller.powerTokens < 1) return res.status(400).json({ error: "Insufficient power tokens" });

// //     const potentialReceivers = await User.find({
// //       knownLanguages: language,
// //       _id: { $ne: caller._id },
// //       isOnline: true
// //     });

// //     if (potentialReceivers.length === 0) {
// //       return res.status(404).json({ error: "No available teachers found" });
// //     }

// //     const call = new Call({
// //       caller: caller._id,
// //       language,
// //       potentialReceivers: potentialReceivers.map((r) => r._id),
// //       status: "pending"
// //     });

// //     await call.save();

// //     const io = socket.getIO();
// //     potentialReceivers.forEach((receiver) => {
// //       io.to(receiver._id.toString()).emit("call-request", {
// //         callId: call._id,
// //         callerId: caller._id,
// //         callerName: caller.name,
// //         language
// //       });
// //     });

// //     console.log(`Call ${call._id} initiated by ${caller.name} for ${language}`);
// //     res.status(200).json({
// //       callId: call._id,
// //       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id, name: r.name }))
// //     });
// //   } catch (error) {
// //     console.error("Initiate call error:", error);
// //     res.status(500).json({ error: "Failed to initiate call", details: error.message });
// //   }
// // };

// exports.acceptCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const userId = req.user._id;

//     const call = await Call.findById(callId);
//     if (!call || call.status !== "pending" || !call.potentialReceivers.includes(userId)) {
//       return res.status(400).json({ message: "Invalid call or not a receiver" });
//     }

//     call.receiver = userId;
//     call.status = "active";
//     call.startTime = new Date();
//     call.potentialReceivers = [];
//     await call.save();

//     const caller = await User.findById(call.caller);
//     if (!caller) return res.status(404).json({ error: "Caller not found" });
//     caller.powerTokens -= 1;
//     await caller.save();

//     const io = socket.getIO();
//     io.to(call.caller.toString()).emit("call-accepted", {
//       callId,
//       receiverId: userId,
//       receiverName: req.user.name,
//     });
//     call.potentialReceivers.forEach((receiverId) => {
//       io.to(receiverId.toString()).emit("call-cancelled", { callId });
//     });

//     res.json({ message: "Call accepted", call });
//   } catch (error) {
//     console.error("Accept call error:", error);
//     res.status(500).json({ error: "Failed to accept call", details: error.message });
//   }
// };

// exports.extendCall = async (req, res) => {
//   try {
//     const { callId, extend } = req.body;
//     const requester = req.user;

//     if (!requester) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });
//     if (typeof extend !== 'boolean') return res.status(400).json({ error: "Extend must be a boolean" });

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call) return res.status(404).json({ error: "Call not found" });
//     if (call.status !== "active") return res.status(400).json({ error: `Call is not active, current status: ${call.status}` });
//     if (!call.startTime) return res.status(400).json({ error: "Call start time not set" });

//     const duration = (Date.now() - call.startTime) / 1000;
//     console.log(`Call ${callId} duration: ${duration.toFixed(0)} seconds`);
//     if (duration < 5) { // Adjusted for testing; change to 120 in production
//       return res.status(400).json({ 
//         error: `Cannot extend call yet, duration is ${duration.toFixed(0)} seconds (minimum 5 seconds required)` 
//       });
//     }

//     const io = socket.getIO();
//     const otherUserId = call.caller._id.toString() === requester._id.toString() ? call.receiver._id : call.caller._id;

//     if (extend) {
//       if (call.caller.powerTokens < 1) return res.status(400).json({ error: "Caller has insufficient power tokens" });
//       io.to(otherUserId.toString()).emit("extend-request", {
//         callId,
//         requesterId: requester._id,
//         requesterName: requester.name
//       });
//       console.log(`Call ${callId} extension requested by ${requester.name}`);
//       res.status(200).json({ message: "Extension request sent, awaiting approval" });
//     } else {
//       await exports.endCall({ body: { callId } }, res);
//     }
//   } catch (error) {
//     console.error("Extend call error:", error);
//     res.status(500).json({ error: "Failed to extend call", details: error.message });
//   }
// };

// exports.endCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const call = await Call.findById(callId).populate("caller receiver");

//     if (!call || call.status !== "active") return res.status(400).json({ error: "Invalid call" });

//     call.endTime = Date.now();
//     call.duration = (call.endTime - call.startTime) / 1000;
//     call.status = call.duration >= 5 ? "completed" : "disconnected"; // Adjusted for testing

//     if (call.status === "completed" && call.receiver) {
//       call.receiver.coinTokens = (call.receiver.coinTokens || 0) + 1;
//       await call.receiver.save();
//     }

//     await call.save();

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-ended", { callId, status: call.status });
//     io.to(call.receiver._id.toString()).emit("call-ended", { callId, status: call.status });

//     console.log(`Call ${callId} ended with status: ${call.status}`);
//     res.status(200).json({ message: "Call ended", call });
//   } catch (error) {
//     console.error("End call error:", error);
//     res.status(500).json({ error: "Failed to end call", details: error.message });
//   }
// };

// exports.approveExtendCall = async (req, res) => {
//   try {
//     const { callId, approve } = req.body;
//     const approver = req.user;

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call || call.status !== "active" || (call.caller._id.toString() !== approver._id.toString() && call.receiver._id.toString() !== approver._id.toString())) {
//       return res.status(400).json({ error: "Invalid call or user" });
//     }

//     const io = socket.getIO();
//     if (approve && call.caller.powerTokens >= 1) {
//       call.caller.powerTokens -= 1;
//       call.extended = true;
//       call.receiver.coinTokens = (call.receiver.coinTokens || 0) + 1;
//       await call.caller.save();
//       await call.receiver.save();
//       await call.save();

//       io.to(call.caller._id.toString()).emit("call-extended", { callId });
//       io.to(call.receiver._id.toString()).emit("call-extended", { callId });

//       console.log(`Call ${callId} extended after approval by ${approver.name}`);
//       res.status(200).json({ message: "Call extended" });
//     } else {
//       io.to(call.caller._id.toString()).emit("extend-denied", { callId });
//       io.to(call.receiver._id.toString()).emit("extend-denied", { callId });
//       console.log(`Call ${callId} extension denied by ${approver.name}`);
//       res.status(200).json({ message: "Extension denied" });
//     }
//   } catch (error) {
//     console.error("Approve extend call error:", error);
//     res.status(500).json({ error: "Failed to approve extend call", details: error.message });
//   }
// };

// exports.rejectCall = async (req, res) => {
//   try {
//     const { callId } = req.body;
//     const receiver = req.user;

//     const call = await Call.findById(callId).populate("caller");
//     if (!call || call.status !== "pending" || !call.potentialReceivers.includes(receiver._id)) {
//       return res.status(400).json({ error: "Invalid or unavailable call" });
//     }

//     call.potentialReceivers = call.potentialReceivers.filter(
//       (id) => id.toString() !== receiver._id.toString()
//     );

//     if (call.potentialReceivers.length === 0) {
//       call.status = "cancelled";
//     }
//     await call.save();

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-rejected", {
//       callId,
//       receiverId: receiver._id,
//       receiverName: receiver.name
//     });

//     console.log(`Call ${callId} rejected by ${receiver.name}`);
//     res.status(200).json({ message: "Call rejected" });
//   } catch (error) {
//     console.error("Reject call error:", error);
//     res.status(500).json({ error: "Failed to reject call", details: error.message });
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

//     const io = socket.getIO();
//     call.potentialReceivers.forEach((receiverId) => {
//       io.to(receiverId.toString()).emit("call-cancelled", { callId });
//     });

//     console.log(`Call ${callId} cancelled by ${caller.name}`);
//     res.status(200).json({ message: "Call cancelled" });
//   } catch (error) {
//     console.error("Cancel call error:", error);
//     res.status(500).json({ error: "Failed to cancel call", details: error.message });
//   }
// };

// // exports.setOnlineStatus = async (req, res) => {
// //   try {
// //     const { isOnline } = req.body;
// //     const user = req.user;

// //     if (!user) return res.status(401).json({ error: "User not authenticated" });
// //     if (typeof isOnline !== 'boolean') return res.status(400).json({ error: "isOnline must be a boolean" });

// //     user.isOnline = isOnline;
// //     await user.save();

// //     const io = socket.getIO();
// //     if (isOnline) {
// //       io.to(user._id.toString()).emit("online-status", { status: "online" });
// //     }

// //     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
// //     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
// //   } catch (error) {
// //     console.error("Set online status error:", error);
// //     res.status(500).json({ error: "Failed to set online status", details: error.message });
// //   }
// // };

// // exports.getCurrentCall = async (req, res) => {
// //   try {
// //     const userId = req.user._id;
// //     const currentCall = await Call.findOne({
// //       $or: [
// //         { caller: userId, status: { $in: ['pending', 'active'] } },
// //         { receiver: userId, status: 'active' },
// //         { potentialReceivers: userId, status: 'pending' }
// //     ]}).populate('caller receiver', 'name');

// //     if (!currentCall) return res.json({ call: null });

// //     const callData = {
// //       _id: currentCall._id,
// //       status: currentCall.status,
// //       language: currentCall.language,
// //       caller: currentCall.caller ? { _id: currentCall.caller._id, name: currentCall.caller.name } : null,
// //       receiver: currentCall.receiver ? { _id: currentCall.receiver._id, name: currentCall.receiver.name } : null,
// //       receivers: currentCall.status === 'pending' ? currentCall.potentialReceivers.map(id => ({ id: id.toString() })) : [],
// //       extended: currentCall.extended || false
// //     };

// //     console.log('getCurrentCall - Returning:', callData);
// //     res.json({ call: callData });
// //   } catch (error) {
// //     console.error("Get current call error:", error);
// //     res.status(500).json({ error: "Failed to get current call", details: error.message });
// //   }
// // };

// // exports.setOnlineStatus = async (req, res) => {
// //   try {
// //     console.log('Set online status - Request body:', req.body);
// //     console.log('Set online status - User:', req.user);

// //     const { isOnline } = req.body;
// //     const user = req.user;

// //     if (!user) return res.status(401).json({ error: "User not authenticated" });
// //     if (typeof isOnline !== 'boolean') return res.status(400).json({ error: "isOnline must be a boolean" });

// //     user.isOnline = isOnline;
// //     await user.save();

// //     const io = socket.getIO();
// //     if (isOnline) {
// //       io.to(user._id.toString()).emit("online-status", { status: "online" });
// //     }

// //     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
// //     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
// //   } catch (error) {
// //     console.error("Set online status error:", error.message);
// //     res.status(500).json({ error: "Failed to set online status", details: error.message });
// //   }
// // };
// exports.setOnlineStatus = async (req, res) => {
//   try {
//     console.log('Set online status - Request body:', req.body);
//     console.log('Set online status - User:', req.user);

//     const { isOnline } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (typeof isOnline !== 'boolean') {
//       console.log('Invalid isOnline value:', isOnline);
//       return res.status(400).json({ error: "isOnline must be a boolean" });
//     }

//     user.isOnline = isOnline;
//     await user.save();

//     const io = socket.getIO();
//     if (isOnline) {
//       io.to(user._id.toString()).emit("online-status", { status: "online" });
//     }

//     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
//     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
//   } catch (error) {
//     console.error("Set online status error:", error.message);
//     res.status(500).json({ error: "Failed to set online status", details: error.message });
//   }
// };
// // Ensure getCurrentCall matches frontend expectations
// exports.getCurrentCall = async (req, res) => {
//   try {
//     console.log('Get current call - User ID:', req.user._id);
//     const userId = req.user._id;
//     const currentCall = await Call.findOne({
//       $or: [
//         { caller: userId, status: { $in: ['pending', 'active'] } },
//         { receiver: userId, status: 'active' },
//         { potentialReceivers: userId, status: 'pending' }
//       ]
//     }).populate('caller receiver', 'name');

//     if (!currentCall) return res.json({ call: null });

//     const callData = {
//       _id: currentCall._id,
//       status: currentCall.status,
//       language: currentCall.language,
//       caller: currentCall.caller ? { _id: currentCall.caller._id, name: currentCall.caller.name } : null,
//       receiver: currentCall.receiver ? { _id: currentCall.receiver._id, name: currentCall.receiver.name } : null,
//       receivers: currentCall.status === 'pending' ? currentCall.potentialReceivers.map(id => ({ id: id.toString() })) : [],
//       extended: currentCall.extended || false
//     };

//     console.log('getCurrentCall - Returning:', callData);
//     res.json({ call: callData });
//   } catch (error) {
//     console.error("Get current call error:", error.message);
//     res.status(500).json({ error: "Failed to get current call", details: error.message });
//   }
// };

// module.exports = exports;







// const User = require("../models/userModel");
// const Call = require("../models/callModel");
// const socket = require("../socket");
// exports.initiateCall = async (req, res) => {
//   try {
//     console.log('Initiate call - Request body:', req.body);
//     console.log('Initiate call - User:', req.user);

//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller) return res.status(401).json({ error: "User not authenticated" });
//     if (!caller._id) return res.status(400).json({ error: "User ID missing" });
//     if (!language || typeof language !== 'string') {
//       console.log('Invalid language:', language);
//       return res.status(400).json({ error: "Language must be a string" });
//     }
//     if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
//       console.log(`Insufficient power tokens for ${caller.name}: ${caller.powerTokens}`);
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const potentialReceivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id },
//       isOnline: true
//     });
//     console.log('Potential receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

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
//     console.log('Call saved:', call._id.toString());

//     const io = socket.getIO();
//     potentialReceivers.forEach((receiver) => {
//       io.to(receiver._id.toString()).emit("call-request", {
//         callId: call._id.toString(),
//         callerId: caller._id.toString(),
//         callerName: caller.name,
//         language
//       });
//       console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);
//     });

//     res.status(200).json({
//       callId: call._id.toString(),
//       potentialReceivers: potentialReceivers.map((r) => ({ id: r._id.toString(), name: r.name }))
//     });
//   } catch (error) {
//     console.error("Initiate call error:", error.stack);
//     res.status(500).json({ error: "Failed to initiate call", details: error.message });
//   }
// };

// exports.acceptCall = async (req, res) => {
//   try {
//     console.log('Accept call - Request body:', req.body);
//     console.log('Accept call - User:', req.user);

//     const { callId } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId);
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "pending") {
//       console.log('Call not pending:', call.status);
//       return res.status(400).json({ error: "Call is not pending" });
//     }
//     if (!call.potentialReceivers.some(id => id.toString() === user._id.toString())) {
//       console.log('User not in potential receivers:', user._id);
//       return res.status(403).json({ error: "You are not authorized to accept this call" });
//     }

//     call.status = "active";
//     call.receiver = user._id;
//     await call.save();
//     console.log('Call accepted:', call._id.toString());

//     const io = socket.getIO();
//     io.to(call.caller.toString()).emit("call-accepted", {
//       callId: call._id.toString(),
//       receiverId: user._id.toString(),
//       receiverName: user.name
//     });
//     console.log(`Emitted call-accepted to caller ${call.caller}`);

//     res.status(200).json({ message: "Call accepted" });
//   } catch (error) {
//     console.error("Accept call error:", error.stack);
//     res.status(500).json({ error: "Failed to accept call", details: error.message });
//   }
// };

// exports.endCall = async (req, res) => {
//   try {
//     console.log('End call - Request body:', req.body);
//     console.log('End call - User:', req.user);

//     const { callId } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId);
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "active") {
//       console.log('Call not active:', call.status);
//       return res.status(400).json({ error: "Call is not active" });
//     }
//     if (![call.caller.toString(), call.receiver?.toString()].includes(user._id.toString())) {
//       console.log('Unauthorized user:', user._id, 'Caller:', call.caller, 'Receiver:', call.receiver);
//       return res.status(403).json({ error: "You are not authorized to end this call" });
//     }

//     call.status = "ended";
//     console.log('Attempting to save call with status "ended":', call._id.toString());
//     await call.save();
//     console.log('Call ended and saved:', call._id.toString());

//     const io = socket.getIO();
//     const otherUserId = call.caller.toString() === user._id.toString() ? call.receiver : call.caller;
//     if (otherUserId) {
//       io.to(otherUserId.toString()).emit("call-ended", {
//         callId: call._id.toString(),
//         status: "ended"
//       });
//       console.log(`Emitted call-ended to ${otherUserId}`);
//     }
//     io.to(user._id.toString()).emit("call-ended", {
//       callId: call._id.toString(),
//       status: "ended"
//     });
//     console.log(`Emitted call-ended to ${user._id}`);

//     res.status(200).json({ message: "Call ended" });
//   } catch (error) {
//     console.error("End call error:", error.stack);
//     res.status(500).json({ error: "Failed to end call", details: error.message });
//   }
// };
// exports.cancelCall = async (req, res) => {
//   try {
//     console.log('Cancel call - Request body:', req.body);
//     console.log('Cancel call - User:', req.user);

//     const { callId } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId);
//     if (!call || call.status !== "pending") {
//       return res.status(400).json({ error: "Call not found or not pending" });
//     }
//     if (call.caller.toString() !== user._id.toString()) {
//       return res.status(403).json({ error: "You are not authorized to cancel this call" });
//     }

//     call.status = "cancelled";
//     await call.save();
//     console.log('Call cancelled:', call._id);

//     const io = socket.getIO();
//     call.potentialReceivers.forEach((receiverId) => {
//       io.to(receiverId.toString()).emit("call-cancelled", {
//         callId: call._id
//       });
//       console.log(`Emitted call-cancelled to ${receiverId}`);
//     });

//     res.status(200).json({ message: "Call cancelled" });
//   } catch (error) {
//     console.error("Cancel call error:", error.message);
//     res.status(500).json({ error: "Failed to cancel call", details: error.message });
//   }
// };

// exports.rejectCall = async (req, res) => {
//   try {
//     console.log('Reject call - Request body:', req.body);
//     console.log('Reject call - User:', req.user);

//     const { callId } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId);
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "pending") {
//       console.log('Call not pending:', call.status);
//       return res.status(400).json({ error: "Call is not pending" });
//     }
//     if (!call.potentialReceivers.some(id => id.toString() === user._id.toString())) {
//       console.log('User not in potential receivers:', user._id);
//       return res.status(403).json({ error: "You are not authorized to reject this call" });
//     }

//     // Update call status
//     call.status = "rejected";
//     console.log('Attempting to save call with status "rejected":', call._id.toString());
//     await call.save();
//     console.log('Call rejected and saved:', call._id.toString());

//     // Notify the caller
//     const io = socket.getIO();
//     if (!call.caller) {
//       console.error('No caller ID found for call:', call._id.toString());
//       return res.status(500).json({ error: "Invalid call data: missing caller" });
//     }
//     const callerId = call.caller.toString();
//     io.to(callerId).emit("call-rejected", {
//       callId: call._id.toString(),
//       receiverName: user.name
//     });
//     console.log(`Emitted call-rejected to caller ${callerId}`);

//     res.status(200).json({ message: "Call rejected" });
//   } catch (error) {
//     console.error("Reject call error:", error.stack);
//     res.status(500).json({ error: "Failed to reject call", details: error.message });
//   }
// };
// exports.extendCall = async (req, res) => {
//   try {
//     console.log('Extend call - Request body:', req.body);
//     console.log('Extend call - User:', req.user);

//     const { callId, extend } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId || typeof extend !== 'boolean') {
//       return res.status(400).json({ error: "Call ID and extend (boolean) are required" });
//     }

//     const call = await Call.findById(callId);
//     if (!call || call.status !== "active") {
//       return res.status(400).json({ error: "Call not found or not active" });
//     }
//     if (![call.caller.toString(), call.receiver.toString()].includes(user._id.toString())) {
//       return res.status(403).json({ error: "You are not authorized to extend this call" });
//     }
//     if (user.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const io = socket.getIO();
//     const otherUserId = call.caller.toString() === user._id.toString() ? call.receiver : call.caller;
//     io.to(otherUserId.toString()).emit("extend-request", {
//       callId: call._id,
//       requesterId: user._id,
//       requesterName: user.name
//     });
//     console.log(`Emitted extend-request to ${otherUserId}`);

//     res.status(200).json({ message: "Extension request sent" });
//   } catch (error) {
//     console.error("Extend call error:", error.message);
//     res.status(500).json({ error: "Failed to extend call", details: error.message });
//   }
// };

// exports.approveExtendCall = async (req, res) => {
//   try {
//     console.log('Approve extend call - Request body:', req.body);
//     console.log('Approve extend call - User:', req.user);

//     const { callId, approve } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId || typeof approve !== 'boolean') {
//       return res.status(400).json({ error: "Call ID and approve (boolean) are required" });
//     }

//     const call = await Call.findById(callId);
//     if (!call || call.status !== "active") {
//       return res.status(400).json({ error: "Call not found or not active" });
//     }
//     if (![call.caller.toString(), call.receiver.toString()].includes(user._id.toString())) {
//       return res.status(403).json({ error: "You are not authorized to approve this extension" });
//     }

//     const io = socket.getIO();
//     const otherUserId = call.caller.toString() === user._id.toString() ? call.receiver : call.caller;

//     if (approve) {
//       call.extended = true;
//       await call.save();
//       io.to(otherUserId.toString()).emit("call-extended", {
//         callId: call._id
//       });
//       io.to(user._id.toString()).emit("call-extended", {
//         callId: call._id
//       });
//       console.log(`Call ${call._id} extended, emitted to ${otherUserId} and ${user._id}`);
//       res.status(200).json({ message: "Call extension approved" });
//     } else {
//       io.to(otherUserId.toString()).emit("extend-denied", {
//         callId: call._id
//       });
//       console.log(`Extension denied, emitted to ${otherUserId}`);
//       res.status(200).json({ message: "Call extension denied" });
//     }
//   } catch (error) {
//     console.error("Approve extend call error:", error.message);
//     res.status(500).json({ error: "Failed to approve extension", details: error.message });
//   }
// };

// exports.setOnlineStatus = async (req, res) => {
//   try {
//     console.log('Set online status - Request body:', req.body);
//     console.log('Set online status - User:', req.user);

//     const { isOnline } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (typeof isOnline !== 'boolean') {
//       console.log('Invalid isOnline value:', isOnline);
//       return res.status(400).json({ error: "isOnline must be a boolean" });
//     }

//     user.isOnline = isOnline;
//     await user.save();

//     const io = socket.getIO();
//     if (isOnline) {
//       io.to(user._id.toString()).emit("online-status", { status: "online" });
//     }

//     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
//     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
//   } catch (error) {
//     console.error("Set online status error:", error.message);
//     res.status(500).json({ error: "Failed to set online status", details: error.message });
//   }
// };
// // exports.getCurrentCall = async (req, res) => {
// //   try {
// //     console.log('Get current call - User:', req.user);

// //     const user = req.user;
// //     if (!user) return res.status(401).json({ error: "User not authenticated" });

// //     const call = await Call.findOne({
// //       $or: [
// //         { caller: user._id, status: { $in: ['pending', 'active'] } },
// //         { receiver: user._id, status: 'active' },
// //         { potentialReceivers: user._id, status: 'pending' }
// //       ]
// //     }).populate('caller', 'name').populate('receiver', 'name');

// //     if (!call) {
// //       console.log('No active or pending call found for user:', user._id);
// //       return res.status(200).json({ call: null });
// //     }

// //     console.log('Current call found:', call._id.toString());
// //     res.status(200).json({ call });
// //   } catch (error) {
// //     console.error("Get current call error:", error.stack);
// //     res.status(500).json({ error: "Failed to get current call", details: error.message });
// //   }
// // };
// exports.getCurrentCall = async (req, res) => {
//   try {
//     console.log('Get current call - User:', req.user);

//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     const call = await Call.findOne({
//       $or: [
//         { caller: user._id, status: { $in: ['pending', 'active'] } },
//         { receiver: user._id, status: 'active' },
//         { potentialReceivers: user._id, status: 'pending' }
//       ]
//     })
//       .populate('caller', 'name')
//       .populate('receiver', 'name')
//       .populate('potentialReceivers', 'name'); // Add this to get names

//     if (!call) {
//       console.log('No active or pending call found for user:', user._id);
//       return res.status(200).json({ call: null });
//     }

//     console.log('Current call found:', call._id.toString());
//     res.status(200).json({ call });
//   } catch (error) {
//     console.error("Get current call error:", error.stack);
//     res.status(500).json({ error: "Failed to get current call", details: error.message });
//   }
// };
// module.exports = exports;



// const User = require("../models/userModel");
// const Call = require("../models/callModel");
// const socket = require("../socket");

// exports.initiateCall = async (req, res) => {
//   try {
//     console.log('Initiate call - Request body:', req.body);
//     console.log('Initiate call - User:', req.user);

//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller) return res.status(401).json({ error: "User not authenticated" });
//     if (!language || typeof language !== 'string') {
//       console.log('Invalid language:', language);
//       return res.status(400).json({ error: "Language must be a string" });
//     }
//     if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
//       console.log(`Insufficient power tokens for ${caller.name}: ${caller.powerTokens}`);
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const potentialReceivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id },
//       isOnline: true
//     });
//     console.log('Potential receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

//     if (potentialReceivers.length === 0) {
//       return res.status(404).json({ error: "No available teachers found" });
//     }

//     const call = new Call({
//       caller: caller._id,
//       language,
//       potentialReceivers: potentialReceivers.map(r => r._id),
//       status: "pending",
//       startTime: new Date()
//     });

//     await call.save();
//     console.log('Call saved:', call._id.toString());

//     const io = socket.getIO();
//     potentialReceivers.forEach((receiver) => {
//       io.to(receiver._id.toString()).emit("call-request", {
//         callId: call._id.toString(),
//         callerId: caller._id.toString(),
//         callerName: caller.name,
//         language
//       });
//       console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);
//     });

//     res.status(200).json({
//       callId: call._id.toString(),
//       potentialReceivers: potentialReceivers.map(r => ({ id: r._id.toString(), name: r.name }))
//     });
//   } catch (error) {
//     console.error("Initiate call error:", error.stack);
//     res.status(500).json({ error: "Failed to initiate call", details: error.message });
//   }
// };

// exports.acceptCall = async (req, res) => {
//   try {
//     console.log('Accept call - Request body:', req.body);
//     console.log('Accept call - User:', req.user);

//     const { callId } = req.body;
//     const receiver = req.user;

//     if (!receiver) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId).populate("caller");
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "pending") {
//       console.log('Call not pending:', call.status);
//       return res.status(400).json({ error: "Call is not pending" });
//     }
//     if (!call.potentialReceivers.some(id => id.toString() === receiver._id.toString())) {
//       console.log('User not in potential receivers:', receiver._id);
//       return res.status(403).json({ error: "You are not authorized to accept this call" });
//     }

//     const caller = call.caller;
//     if (caller.powerTokens < 1) {
//       call.status = "cancelled";
//       await call.save();
//       return res.status(400).json({ error: "Caller has insufficient power tokens" });
//     }

//     caller.powerTokens -= 1;
//     await caller.save();

//     call.status = "active";
//     call.receiver = receiver._id;
//     call.potentialReceivers = [];
//     call.startTime = new Date(); // Ensure startTime is set
//     await call.save();
//     console.log('Call accepted:', call._id.toString(), 'Receiver:', receiver._id.toString());

//     const io = socket.getIO();
//     const callAcceptedData = {
//       callId: call._id.toString(),
//       receiverId: receiver._id.toString(),
//       receiverName: receiver.name
//     };
//     console.log('Emitting call-accepted to caller:', caller._id.toString(), 'Data:', callAcceptedData);
//     io.to(caller._id.toString()).emit("call-accepted", callAcceptedData);

//     // Auto-end after 2 minutes (120,000 ms) if not extended
//     setTimeout(async () => {
//       const updatedCall = await Call.findById(callId).populate("caller receiver");
//       if (updatedCall && updatedCall.status === "active" && !updatedCall.extended) {
//         updatedCall.endTime = new Date();
//         updatedCall.duration = updatedCall.endTime - updatedCall.startTime;
//         updatedCall.status = updatedCall.duration >= 120000 ? "completed" : "disconnected";
//         if (updatedCall.status === "completed") {
//           updatedCall.receiver.coinTokens += 1;
//           await updatedCall.receiver.save();
//         }
//         await updatedCall.save();

//         io.to(updatedCall.caller._id.toString()).emit("call-ended", {
//           callId: updatedCall._id.toString(),
//           status: updatedCall.status
//         });
//         io.to(updatedCall.receiver._id.toString()).emit("call-ended", {
//           callId: updatedCall._id.toString(),
//           status: updatedCall.status
//         });
//         console.log(`Call ${callId} auto-ended after 120 seconds with status: ${updatedCall.status}`);
//       }
//     }, 300000);

//     res.status(200).json({ message: "Call accepted" });
//   } catch (error) {
//     console.error("Accept call error:", error.stack);
//     res.status(500).json({ error: "Failed to accept call", details: error.message });
//   }
// };
// exports.rejectCall = async (req, res) => {
//   try {
//     console.log('Reject call - Request body:', req.body);
//     console.log('Reject call - User:', req.user);

//     const { callId } = req.body;
//     const receiver = req.user;

//     if (!receiver) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId).populate("caller");
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "pending") {
//       console.log('Call not pending:', call.status);
//       return res.status(400).json({ error: "Call is not pending" });
//     }
//     if (!call.potentialReceivers.some(id => id.toString() === receiver._id.toString())) {
//       console.log('User not in potential receivers:', receiver._id);
//       return res.status(403).json({ error: "You are not authorized to reject this call" });
//     }

//     call.potentialReceivers = call.potentialReceivers.filter(
//       id => id.toString() !== receiver._id.toString()
//     );
//     if (call.potentialReceivers.length === 0) {
//       call.status = "cancelled";
//     } else {
//       call.status = "rejected";
//     }
//     await call.save();
//     console.log('Call rejected and saved:', call._id.toString());

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-rejected", {
//       callId: call._id.toString(),
//       receiverName: receiver.name
//     });
//     console.log(`Emitted call-rejected to caller ${call.caller._id}`);

//     res.status(200).json({ message: "Call rejected" });
//   } catch (error) {
//     console.error("Reject call error:", error.stack);
//     res.status(500).json({ error: "Failed to reject call", details: error.message });
//   }
// };

// exports.endCall = async (req, res) => {
//   try {
//     console.log('End call - Request body:', req.body);
//     console.log('End call - User:', req.user);

//     const { callId } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call) {
//       console.log('Call not found:', callId);
//       return res.status(404).json({ error: "Call not found" });
//     }
//     if (call.status !== "active") {
//       console.log('Call not active:', call.status);
//       return res.status(400).json({ error: "Call is not active" });
//     }
//     if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(user._id.toString())) {
//       console.log('Unauthorized user:', user._id, 'Caller:', call.caller._id, 'Receiver:', call.receiver?._id);
//       return res.status(403).json({ error: "You are not authorized to end this call" });
//     }

//     call.endTime = new Date();
//     call.duration = call.endTime - call.startTime;
//     call.status = call.duration >= 120000 ? "completed" : "disconnected";
//     if (call.status === "completed" && call.receiver) {
//       call.receiver.coinTokens += 1;
//       await call.receiver.save();
//     }
//     await call.save();
//     console.log('Call ended and saved:', call._id.toString(), 'Status:', call.status);

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-ended", {
//       callId: call._id.toString(),
//       status: call.status
//     });
//     if (call.receiver) {
//       io.to(call.receiver._id.toString()).emit("call-ended", {
//         callId: call._id.toString(),
//         status: call.status
//       });
//       console.log(`Emitted call-ended to ${call.receiver._id}`);
//     }
//     console.log(`Emitted call-ended to ${call.caller._id}`);

//     res.status(200).json({ message: "Call ended" });
//   } catch (error) {
//     console.error("End call error:", error.stack);
//     res.status(500).json({ error: "Failed to end call", details: error.message });
//   }
// };

// exports.cancelCall = async (req, res) => {
//   try {
//     console.log('Cancel call - Request body:', req.body);
//     console.log('Cancel call - User:', req.user);

//     const { callId } = req.body;
//     const caller = req.user;

//     if (!caller) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId) return res.status(400).json({ error: "Call ID is required" });

//     const call = await Call.findById(callId);
//     if (!call || call.status !== "pending") {
//       console.log('Call not found or not pending:', call?.status);
//       return res.status(400).json({ error: "Call not found or not pending" });
//     }
//     if (call.caller.toString() !== caller._id.toString()) {
//       console.log('Unauthorized user:', caller._id);
//       return res.status(403).json({ error: "You are not authorized to cancel this call" });
//     }

//     call.status = "cancelled";
//     await call.save();
//     console.log('Call cancelled:', call._id.toString());

//     const io = socket.getIO();
//     call.potentialReceivers.forEach((receiverId) => {
//       io.to(receiverId.toString()).emit("call-cancelled", {
//         callId: call._id.toString()
//       });
//       console.log(`Emitted call-cancelled to ${receiverId}`);
//     });

//     res.status(200).json({ message: "Call cancelled" });
//   } catch (error) {
//     console.error("Cancel call error:", error.stack);
//     res.status(500).json({ error: "Failed to cancel call", details: error.message });
//   }
// };

// exports.extendCall = async (req, res) => {
//   try {
//     console.log('Extend call - Request body:', req.body);
//     console.log('Extend call - User:', req.user);

//     const { callId, extend } = req.body;
//     const requester = req.user;

//     if (!requester) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId || typeof extend !== 'boolean') {
//       return res.status(400).json({ error: "Call ID and extend (boolean) are required" });
//     }

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call || call.status !== "active") {
//       console.log('Call not found or not active:', call?.status);
//       return res.status(400).json({ error: "Call not found or not active" });
//     }
//     if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(requester._id.toString())) {
//       return res.status(403).json({ error: "You are not authorized to extend this call" });
//     }
//     if (requester.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const io = socket.getIO();
//     const otherUserId = call.caller._id.toString() === requester._id.toString() ? call.receiver._id : call.caller._id;
//     io.to(otherUserId.toString()).emit("extend-request", {
//       callId: call._id.toString(),
//       requesterId: requester._id.toString(),
//       requesterName: requester.name
//     });
//     console.log(`Emitted extend-request to ${otherUserId}`);

//     res.status(200).json({ message: "Extension request sent" });
//   } catch (error) {
//     console.error("Extend call error:", error.stack);
//     res.status(500).json({ error: "Failed to extend call", details: error.message });
//   }
// };

// exports.approveExtendCall = async (req, res) => {
//   try {
//     console.log('Approve extend call - Request body:', req.body);
//     console.log('Approve extend call - User:', req.user);

//     const { callId, approve } = req.body;
//     const approver = req.user;

//     if (!approver) return res.status(401).json({ error: "User not authenticated" });
//     if (!callId || typeof approve !== 'boolean') {
//       return res.status(400).json({ error: "Call ID and approve (boolean) are required" });
//     }

//     const call = await Call.findById(callId).populate("caller receiver");
//     if (!call || call.status !== "active") {
//       console.log('Call not found or not active:', call?.status);
//       return res.status(400).json({ error: "Call not found or not active" });
//     }
//     if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(approver._id.toString())) {
//       return res.status(403).json({ error: "You are not authorized to approve this extension" });
//     }

//     const io = socket.getIO();
//     const otherUserId = call.caller._id.toString() === approver._id.toString() ? call.receiver._id : call.caller._id;

//     if (approve) {
//       if (call.caller.powerTokens < 1) {
//         return res.status(400).json({ error: "Caller has insufficient power tokens" });
//       }
//       call.caller.powerTokens -= 1;
//       call.extended = true;
//       call.receiver.coinTokens += 1;
//       await call.caller.save();
//       await call.receiver.save();
//       await call.save();

//       io.to(call.caller._id.toString()).emit("call-extended", { callId: call._id.toString() });
//       io.to(call.receiver._id.toString()).emit("call-extended", { callId: call._id.toString() });
//       console.log(`Call ${call._id} extended, emitted to ${call.caller._id} and ${call.receiver._id}`);
//       res.status(200).json({ message: "Call extension approved" });
//     } else {
//       io.to(otherUserId.toString()).emit("extend-denied", { callId: call._id.toString() });
//       console.log(`Extension denied, emitted to ${otherUserId}`);
//       res.status(200).json({ message: "Call extension denied" });
//     }
//   } catch (error) {
//     console.error("Approve extend call error:", error.stack);
//     res.status(500).json({ error: "Failed to approve extension", details: error.message });
//   }
// };

// exports.setOnlineStatus = async (req, res) => {
//   try {
//     console.log('Set online status - Request body:', req.body);
//     console.log('Set online status - User:', req.user);

//     const { isOnline } = req.body;
//     const user = req.user;

//     if (!user) return res.status(401).json({ error: "User not authenticated" });
//     if (typeof isOnline !== 'boolean') {
//       console.log('Invalid isOnline value:', isOnline);
//       return res.status(400).json({ error: "isOnline must be a boolean" });
//     }

//     user.isOnline = isOnline;
//     await user.save();

//     const io = socket.getIO();
//     if (isOnline) {
//       io.to(user._id.toString()).emit("online-status", { status: "online" });
//     }

//     console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
//     res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
//   } catch (error) {
//     console.error("Set online status error:", error.stack);
//     res.status(500).json({ error: "Failed to set online status", details: error.message });
//   }
// };

// exports.getCurrentCall = async (req, res) => {
//   try {
//     console.log('Get current call - User:', req.user);

//     const user = req.user;
//     if (!user) return res.status(401).json({ error: "User not authenticated" });

//     const call = await Call.findOne({
//       $or: [
//         { caller: user._id, status: { $in: ['pending', 'active'] } },
//         { receiver: user._id, status: 'active' },
//         { potentialReceivers: user._id, status: 'pending' }
//       ]
//     })
//       .populate('caller', 'name')
//       .populate('receiver', 'name')
//       .populate('potentialReceivers', 'name');

//     if (!call) {
//       console.log('No active or pending call found for user:', user._id);
//       return res.status(200).json({ call: null });
//     }

//     console.log('Current call found:', call._id.toString());
//     res.status(200).json({ call });
//   } catch (error) {
//     console.error("Get current call error:", error.stack);
//     res.status(500).json({ error: "Failed to get current call", details: error.message });
//   }
// };

// module.exports = exports;




const User = require("../models/userModel");
const Call = require("../models/callModel");
const socket = require("../socket");

exports.initiateCall = async (req, res) => {
  try {
    console.log('Initiate call - Request body:', req.body);
    console.log('Initiate call - User:', req.user);

    const caller = req.user;
    const { language } = req.body;

    if (!caller) return res.status(401).json({ error: "User not authenticated" });
    if (!language || typeof language !== 'string') {
      console.log('Invalid language:', language);
      return res.status(400).json({ error: "Language must be a string" });
    }
    if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
      console.log(`Insufficient power tokens for ${caller.name}: ${caller.powerTokens}`);
      return res.status(400).json({ error: "Insufficient power tokens" });
    }

    const potentialReceivers = await User.find({
      knownLanguages: language,
      _id: { $ne: caller._id },
      isOnline: true
    });
    console.log('Potential receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

    if (potentialReceivers.length === 0) {
      return res.status(404).json({ error: "No available teachers found" });
    }

    const call = new Call({
      caller: caller._id,
      language,
      potentialReceivers: potentialReceivers.map(r => r._id),
      status: "pending",
      startTime: new Date()
    });

    await call.save();
    console.log('Call saved:', call._id.toString());

    const io = socket.getIO();
    potentialReceivers.forEach((receiver) => {
      io.to(receiver._id.toString()).emit("call-request", {
        callId: call._id.toString(),
        callerId: caller._id.toString(),
        callerName: caller.name,
        language
      });
      console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);
    });

    res.status(200).json({
      callId: call._id.toString(),
      potentialReceivers: potentialReceivers.map(r => ({ id: r._id.toString(), name: r.name }))
    });
  } catch (error) {
    console.error("Initiate call error:", error.stack);
    res.status(500).json({ error: "Failed to initiate call", details: error.message });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    console.log('Accept call - Request body:', req.body);
    console.log('Accept call - User:', req.user);

    const { callId } = req.body;
    const receiver = req.user;

    if (!receiver) return res.status(401).json({ error: "User not authenticated" });
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    const call = await Call.findById(callId).populate("caller");
    if (!call) {
      console.log('Call not found:', callId);
      return res.status(404).json({ error: "Call not found" });
    }
    if (call.status !== "pending") {
      console.log('Call not pending:', call.status);
      return res.status(400).json({ error: "Call is not pending" });
    }
    if (!call.potentialReceivers.some(id => id.toString() === receiver._id.toString())) {
      console.log('User not in potential receivers:', receiver._id);
      return res.status(403).json({ error: "You are not authorized to accept this call" });
    }

    const caller = call.caller;
    if (caller.powerTokens < 1) {
      call.status = "cancelled";
      await call.save();
      return res.status(400).json({ error: "Caller has insufficient power tokens" });
    }

    caller.powerTokens -= 1;
    await caller.save();

    call.status = "active";
    call.receiver = receiver._id;
    call.potentialReceivers = [];
    call.startTime = new Date();
    await call.save();
    console.log('Call accepted:', call._id.toString(), 'Receiver:', receiver._id.toString());

    const io = socket.getIO();
    const callAcceptedData = {
      callId: call._id.toString(),
      receiverId: receiver._id.toString(),
      receiverName: receiver.name
    };
    console.log('Emitting call-accepted to caller:', caller._id.toString(), 'Data:', callAcceptedData);
    io.to(caller._id.toString()).emit("call-accepted", callAcceptedData);

    setTimeout(async () => {
      const updatedCall = await Call.findById(callId).populate("caller receiver");
      if (updatedCall && updatedCall.status === "active" && !updatedCall.extended) {
        updatedCall.endTime = new Date();
        updatedCall.duration = updatedCall.endTime - updatedCall.startTime;
        updatedCall.status = updatedCall.duration >= 300000 ? "completed" : "disconnected";
        if (updatedCall.status === "completed") {
          updatedCall.receiver.coinTokens += 1;
          await updatedCall.receiver.save();
        }
        await updatedCall.save();

        io.to(updatedCall.caller._id.toString()).emit("call-ended", {
          callId: updatedCall._id.toString(),
          status: updatedCall.status
        });
        io.to(updatedCall.receiver._id.toString()).emit("call-ended", {
          callId: updatedCall._id.toString(),
          status: updatedCall.status
        });
        console.log(`Call ${callId} auto-ended after 5 minutes with status: ${updatedCall.status}`);
      }
    }, 300000); // 5 minutes

    res.status(200).json({ message: "Call accepted" });
  } catch (error) {
    console.error("Accept call error:", error.stack);
    res.status(500).json({ error: "Failed to accept call", details: error.message });
  }
};

exports.rejectCall = async (req, res) => {
  try {
    console.log('Reject call - Request body:', req.body);
    console.log('Reject call - User:', req.user);

    const { callId } = req.body;
    const receiver = req.user;

    if (!receiver) return res.status(401).json({ error: "User not authenticated" });
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    const call = await Call.findById(callId).populate("caller");
    if (!call) {
      console.log('Call not found:', callId);
      return res.status(404).json({ error: "Call not found" });
    }
    if (call.status !== "pending") {
      console.log('Call not pending:', call.status);
      return res.status(400).json({ error: "Call is not pending" });
    }
    if (!call.potentialReceivers.some(id => id.toString() === receiver._id.toString())) {
      console.log('User not in potential receivers:', receiver._id);
      return res.status(403).json({ error: "You are not authorized to reject this call" });
    }

    call.potentialReceivers = call.potentialReceivers.filter(
      id => id.toString() !== receiver._id.toString()
    );
    if (call.potentialReceivers.length === 0) {
      call.status = "cancelled";
    } else {
      call.status = "rejected";
    }
    await call.save();
    console.log('Call rejected and saved:', call._id.toString());

    const io = socket.getIO();
    io.to(call.caller._id.toString()).emit("call-rejected", {
      callId: call._id.toString(),
      receiverName: receiver.name
    });
    console.log(`Emitted call-rejected to caller ${call.caller._id}`);

    res.status(200).json({ message: "Call rejected" });
  } catch (error) {
    console.error("Reject call error:", error.stack);
    res.status(500).json({ error: "Failed to reject call", details: error.message });
  }
};

exports.endCall = async (req, res) => {
  try {
    console.log('End call - Request body:', req.body);
    console.log('End call - User:', req.user);

    const { callId } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "User not authenticated" });
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    const call = await Call.findById(callId).populate("caller receiver");
    if (!call) {
      console.log('Call not found:', callId);
      return res.status(404).json({ error: "Call not found" });
    }
    if (call.status !== "active") {
      console.log('Call not active:', call.status);
      return res.status(400).json({ error: "Call is not active" });
    }
    if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(user._id.toString())) {
      console.log('Unauthorized user:', user._id, 'Caller:', call.caller._id, 'Receiver:', call.receiver?._id);
      return res.status(403).json({ error: "You are not authorized to end this call" });
    }

    call.endTime = new Date();
    call.duration = call.endTime - call.startTime;
    call.status = call.duration >= 300000 ? "completed" : "disconnected";
    if (call.status === "completed" && call.receiver) {
      call.receiver.coinTokens += 1;
      await call.receiver.save();
    }
    await call.save();
    console.log('Call ended and saved:', call._id.toString(), 'Status:', call.status);

    const io = socket.getIO();
    io.to(call.caller._id.toString()).emit("call-ended", {
      callId: call._id.toString(),
      status: call.status
    });
    if (call.receiver) {
      io.to(call.receiver._id.toString()).emit("call-ended", {
        callId: call._id.toString(),
        status: call.status
      });
      console.log(`Emitted call-ended to ${call.receiver._id}`);
    }
    console.log(`Emitted call-ended to ${call.caller._id}`);

    res.status(200).json({ message: "Call ended" });
  } catch (error) {
    console.error("End call error:", error.stack);
    res.status(500).json({ error: "Failed to end call", details: error.message });
  }
};

exports.cancelCall = async (req, res) => {
  try {
    console.log('Cancel call - Request body:', req.body);
    console.log('Cancel call - User:', req.user);

    const { callId } = req.body;
    const caller = req.user;

    if (!caller) return res.status(401).json({ error: "User not authenticated" });
    if (!callId) return res.status(400).json({ error: "Call ID is required" });

    const call = await Call.findById(callId);
    if (!call || call.status !== "pending") {
      console.log('Call not found or not pending:', call?.status);
      return res.status(400).json({ error: "Call not found or not pending" });
    }
    if (call.caller.toString() !== caller._id.toString()) {
      console.log('Unauthorized user:', caller._id);
      return res.status(403).json({ error: "You are not authorized to cancel this call" });
    }

    call.status = "cancelled";
    await call.save();
    console.log('Call cancelled:', call._id.toString());

    const io = socket.getIO();
    call.potentialReceivers.forEach((receiverId) => {
      io.to(receiverId.toString()).emit("call-cancelled", {
        callId: call._id.toString()
      });
      console.log(`Emitted call-cancelled to ${receiverId}`);
    });

    res.status(200).json({ message: "Call cancelled" });
  } catch (error) {
    console.error("Cancel call error:", error.stack);
    res.status(500).json({ error: "Failed to cancel call", details: error.message });
  }
};

exports.extendCall = async (req, res) => {
  try {
    console.log('Extend call - Request body:', req.body);
    console.log('Extend call - User:', req.user);

    const { callId, extend } = req.body;
    const requester = req.user;

    if (!requester) return res.status(401).json({ error: "User not authenticated" });
    if (!callId || typeof extend !== 'boolean') {
      return res.status(400).json({ error: "Call ID and extend (boolean) are required" });
    }

    const call = await Call.findById(callId).populate("caller receiver");
    if (!call || call.status !== "active") {
      console.log('Call not found or not active:', call?.status);
      return res.status(400).json({ error: "Call not found or not active" });
    }
    if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(requester._id.toString())) {
      return res.status(403).json({ error: "You are not authorized to extend this call" });
    }
    if (requester.powerTokens < 1) {
      return res.status(400).json({ error: "Insufficient power tokens" });
    }

    const io = socket.getIO();
    const otherUserId = call.caller._id.toString() === requester._id.toString() ? call.receiver._id : call.caller._id;
    io.to(otherUserId.toString()).emit("call-extend-request", {
      callId: call._id.toString(),
      requesterId: requester._id.toString(),
      requesterName: requester.name
    });
    console.log(`Emitted call-extend-request to ${otherUserId}`);

    res.status(200).json({ message: "Extension request sent" });
  } catch (error) {
    console.error("Extend call error:", error.stack);
    res.status(500).json({ error: "Failed to extend call", details: error.message });
  }
};

exports.approveExtendCall = async (req, res) => {
  try {
    console.log('Approve extend call - Request body:', req.body);
    console.log('Approve extend call - User:', req.user);

    const { callId, approve } = req.body;
    const approver = req.user;

    if (!approver) return res.status(401).json({ error: "User not authenticated" });
    if (!callId || typeof approve !== 'boolean') {
      return res.status(400).json({ error: "Call ID and approve (boolean) are required" });
    }

    const call = await Call.findById(callId).populate("caller receiver");
    if (!call || call.status !== "active") {
      console.log('Call not found or not active:', call?.status);
      return res.status(400).json({ error: "Call not found or not active" });
    }
    if (![call.caller._id.toString(), call.receiver?._id.toString()].includes(approver._id.toString())) {
      return res.status(403).json({ error: "You are not authorized to approve this extension" });
    }

    const io = socket.getIO();
    const otherUserId = call.caller._id.toString() === approver._id.toString() ? call.receiver._id : call.caller._id;

    if (approve) {
      if (call.caller.powerTokens < 1) {
        return res.status(400).json({ error: "Caller has insufficient power tokens" });
      }
      call.caller.powerTokens -= 1;
      call.extended = true;
      call.receiver.coinTokens += 1;
      await call.caller.save();
      await call.receiver.save();
      await call.save();

      io.to(call.caller._id.toString()).emit("call-extended", { callId: call._id.toString() });
      io.to(call.receiver._id.toString()).emit("call-extended", { callId: call._id.toString() });
      console.log(`Call ${call._id} extended, emitted to ${call.caller._id} and ${call.receiver._id}`);
      res.status(200).json({ message: "Call extension approved" });
    } else {
      io.to(otherUserId.toString()).emit("extend-denied", { callId: call._id.toString() });
      console.log(`Extension denied, emitted to ${otherUserId}`);
      res.status(200).json({ message: "Call extension denied" });
    }
  } catch (error) {
    console.error("Approve extend call error:", error.stack);
    res.status(500).json({ error: "Failed to approve extension", details: error.message });
  }
};

exports.setOnlineStatus = async (req, res) => {
  try {
    console.log('Set online status - Request body:', req.body);
    console.log('Set online status - User:', req.user);

    const { isOnline } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "User not authenticated" });
    if (typeof isOnline !== 'boolean') {
      console.log('Invalid isOnline value:', isOnline);
      return res.status(400).json({ error: "isOnline must be a boolean" });
    }

    user.isOnline = isOnline;
    await user.save();

    const io = socket.getIO();
    if (isOnline) {
      io.to(user._id.toString()).emit("online-status", { status: "online" });
    }

    console.log(`${user.name} is now ${isOnline ? "online" : "offline"}`);
    res.status(200).json({ message: `User set to ${isOnline ? "online" : "offline"}` });
  } catch (error) {
    console.error("Set online status error:", error.stack);
    res.status(500).json({ error: "Failed to set online status", details: error.message });
  }
};

exports.getCurrentCall = async (req, res) => {
  try {
    console.log('Get current call - User:', req.user);

    const user = req.user;
    if (!user) return res.status(401).json({ error: "User not authenticated" });

    const call = await Call.findOne({
      $or: [
        { caller: user._id, status: { $in: ['pending', 'active'] } },
        { receiver: user._id, status: 'active' },
        { potentialReceivers: user._id, status: 'pending' }
      ]
    })
      .populate('caller', 'name')
      .populate('receiver', 'name')
      .populate('potentialReceivers', 'name');

    if (!call) {
      console.log('No active or pending call found for user:', user._id);
      return res.status(200).json({ call: null });
    }

    console.log('Current call found:', call._id.toString());
    res.status(200).json({ call });
  } catch (error) {
    console.error("Get current call error:", error.stack);
    res.status(500).json({ error: "Failed to get current call", details: error.message });
  }
};

module.exports = exports;
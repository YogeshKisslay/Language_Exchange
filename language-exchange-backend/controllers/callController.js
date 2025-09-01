

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
//       isOnline: true,
//       rejectedCalls: { $ne: caller.currentCall } // Exclude users who rejected this call
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
//     caller.currentCall = call._id;
//     await caller.save();
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
//       caller.currentCall = null;
//       await caller.save();
//       await call.save();
//       return res.status(400).json({ error: "Caller has insufficient power tokens" });
//     }

//     caller.powerTokens -= 1;
//     await caller.save();

//     call.status = "active";
//     call.receiver = receiver._id;
//     call.potentialReceivers = [];
//     call.startTime = new Date();
//     await call.save();
//     caller.currentCall = call._id;
//     receiver.currentCall = call._id;
//     await caller.save();
//     await receiver.save();
//     console.log('Call accepted:', call._id.toString(), 'Receiver:', receiver._id.toString());

//     const io = socket.getIO();
//     const callAcceptedData = {
//       callId: call._id.toString(),
//       receiverId: receiver._id.toString(),
//       receiverName: receiver.name
//     };
//     console.log('Emitting call-accepted to caller:', caller._id.toString(), 'Data:', callAcceptedData);
//     io.to(caller._id.toString()).emit("call-accepted", callAcceptedData);

//     setTimeout(async () => {
//       const updatedCall = await Call.findById(callId).populate("caller receiver");
//       if (updatedCall && updatedCall.status === "active" && !updatedCall.extended) {
//         updatedCall.endTime = new Date();
//         updatedCall.duration = updatedCall.endTime - updatedCall.startTime;
//         updatedCall.status = updatedCall.duration >= 300000 ? "completed" : "disconnected";
//         if (updatedCall.status === "completed") {
//           updatedCall.receiver.coinTokens += 1;
//           await updatedCall.receiver.save();
//         }
//         updatedCall.caller.currentCall = null;
//         updatedCall.receiver.currentCall = null;
//         await updatedCall.caller.save();
//         await updatedCall.receiver.save();
//         await updatedCall.save();

//         io.to(updatedCall.caller._id.toString()).emit("call-ended", {
//           callId: updatedCall._id.toString(),
//           status: updatedCall.status
//         });
//         io.to(updatedCall.receiver._id.toString()).emit("call-ended", {
//           callId: updatedCall._id.toString(),
//           status: updatedCall.status
//         });
//         console.log(`Call ${callId} auto-ended after 5 minutes with status: ${updatedCall.status}`);
//       }
//     }, 300000); // 5 minutes

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
//     console.log('Updated potential receivers:', call.potentialReceivers.map(id => id.toString()));

//     if (call.potentialReceivers.length === 0) {
//       call.status = "cancelled";
//       call.caller.currentCall = null;
//       await call.caller.save();
//       console.log('No receivers left, call cancelled:', call._id.toString());
//     } else {
//       console.log('Receivers remain, call stays pending:', call._id.toString());
//     }
//     await call.save();

//     receiver.rejectedCalls = receiver.rejectedCalls || [];
//     if (!receiver.rejectedCalls.includes(call._id)) {
//       receiver.rejectedCalls.push(call._id);
//       await receiver.save();
//       console.log(`Added call ${call._id} to ${receiver.name}'s rejectedCalls`);
//     }

//     const io = socket.getIO();
//     io.to(call.caller._id.toString()).emit("call-rejected", {
//       callId: call._id.toString(),
//       receiverId: receiver._id.toString(),
//       receiverName: receiver.name,
//       remainingReceivers: call.potentialReceivers.length
//     });
//     console.log(`Emitted call-rejected to caller ${call.caller._id} with ${call.potentialReceivers.length} receivers left`);

//     // Notify remaining receivers that the call is still pending
//     if (call.potentialReceivers.length > 0) {
//       call.potentialReceivers.forEach((receiverId) => {
//         io.to(receiverId.toString()).emit("call-still-pending", {
//           callId: call._id.toString(),
//           callerId: call.caller._id.toString(),
//           callerName: call.caller.name,
//           language: call.language
//         });
//         console.log(`Emitted call-still-pending to ${receiverId}`);
//       });
//     }

//     res.status(200).json({ message: "Call rejected" });
//   } catch (error) {
//     console.error("Reject call error:", error.stack);
//     res.status(500).json({ error: "Failed to reject call", details: error.message });
//   }
// };
// // Rest of the file remains unchanged

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
//     call.status = call.duration >= 300000 ? "completed" : "disconnected";
//     if (call.status === "completed" && call.receiver) {
//       call.receiver.coinTokens += 1;
//       await call.receiver.save();
//     }
//     call.caller.currentCall = null;
//     if (call.receiver) call.receiver.currentCall = null;
//     await call.caller.save();
//     if (call.receiver) await call.receiver.save();
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
//     caller.currentCall = null;
//     await caller.save();
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
//     io.to(otherUserId.toString()).emit("call-extend-request", {
//       callId: call._id.toString(),
//       requesterId: requester._id.toString(),
//       requesterName: requester.name
//     });
//     console.log(`Emitted call-extend-request to ${otherUserId}`);

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

//     // Check if user has an active or pending call via currentCall
//     let call = await Call.findById(user.currentCall)
//       .populate('caller', 'name')
//       .populate('receiver', 'name')
//       .populate('potentialReceivers', 'name');

//     // If no call found via currentCall, check if user is a potential receiver in a pending call
//     if (!call) {
//       call = await Call.findOne({
//         status: "pending",
//         potentialReceivers: user._id,
//       })
//         .populate('caller', 'name')
//         .populate('receiver', 'name')
//         .populate('potentialReceivers', 'name');
//     }

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

// // exports.initiateSelectiveCall = async (req, res) => {
// //   try {
// //     console.log('Initiate selective call - Request body:', req.body);
// //     console.log('Initiate selective call - User:', req.user);

// //     const caller = req.user;
// //     const { receiverId, language } = req.body;

// //     if (!caller || !caller.premium) return res.status(403).json({ error: "Premium access required" });
// //     if (!receiverId || !language) return res.status(400).json({ error: "Receiver ID and language required" });
// //     if (caller.powerTokens < 1) return res.status(400).json({ error: "Insufficient power tokens" });

// //     const receiver = await User.findById(receiverId);
// //     if (!receiver || !receiver.isOnline) return res.status(404).json({ error: "Receiver not found or offline" });

// //     const call = new Call({
// //       caller: caller._id,
// //       receiver: receiver._id,
// //       potentialReceivers: [receiver._id],
// //       language,
// //       status: "pending",
// //       startTime: new Date(),
// //     });

// //     await call.save();
// //     caller.currentCall = call._id;
// //     await caller.save();
// //     console.log('Selective call saved:', call._id.toString());

// //     const io = socket.getIO();
// //     io.to(receiver._id.toString()).emit("call-request", {
// //       callId: call._id.toString(),
// //       callerId: caller._id.toString(),
// //       callerName: caller.name,
// //       language,
// //     });
// //     console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);

// //     res.status(200).json({ callId: call._id.toString(), receiver: { id: receiver._id.toString(), name: receiver.name } });
// //   } catch (error) {
// //     console.error("Initiate selective call error:", error.stack);
// //     res.status(500).json({ error: "Failed to initiate selective call", details: error.message });
// //   }
// // };
// exports.initiateSelectiveCall = async (req, res) => {
//   try {
//     console.log('Initiate selective call - Request body:', req.body);
//     console.log('Initiate selective call - User:', req.user);

//     const caller = req.user;
//     const { receiverId, language } = req.body; // Language is optional

//     if (!caller || !caller.premium) return res.status(403).json({ error: "Premium access required" });
//     if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });
//     if (caller.powerTokens < 1) return res.status(400).json({ error: "Insufficient power tokens" });

//     const receiver = await User.findById(receiverId);
//     if (!receiver || !receiver.isOnline) return res.status(404).json({ error: "Receiver not found or offline" });

//     const call = new Call({
//       caller: caller._id,
//       receiver: receiver._id,
//       potentialReceivers: [receiver._id],
//       language: language || "Not specified", // Default if no language provided
//       status: "pending",
//       startTime: new Date(),
//     });

//     await call.save();
//     caller.currentCall = call._id;
//     await caller.save();
//     console.log('Selective call saved:', call._id.toString());

//     const io = socket.getIO();
//     io.to(receiver._id.toString()).emit("call-request", {
//       callId: call._id.toString(),
//       callerId: caller._id.toString(),
//       callerName: caller.name,
//       language: call.language,
//     });
//     console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);

//     res.status(200).json({ callId: call._id.toString(), receiver: { id: receiver._id.toString(), name: receiver.name } });
//   } catch (error) {
//     console.error("Initiate selective call error:", error.stack);
//     res.status(500).json({ error: "Failed to initiate selective call", details: error.message });
//   }
// };
// // Rest of the file remains unchanged (including previous rejectCall fix)
// module.exports = exports;


const User = require("../models/userModel");
const Call = require("../models/callModel");
const MissedCall = require("../models/missedCallModel"); // <-- Import the new model
const socket = require("../socket");

exports.initiateCall = async (req, res) => {
  try {
    console.log('Initiate call - Request body:', req.body);
    console.log('Initiate call - User:', req.user);

    const caller = req.user;
    const { language } = req.body;

    if (!caller) return res.status(401).json({ error: "User not authenticated" });
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: "Language must be a string" });
    }
    if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
      return res.status(400).json({ error: "Insufficient power tokens" });
    }

    const potentialReceivers = await User.find({
      knownLanguages: language,
      _id: { $ne: caller._id },
      isOnline: true,
    });
    console.log('Potential online receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

    if (potentialReceivers.length === 0) {
      // --- MODIFIED LOGIC TO PREVENT DUPLICATES ---
      console.log("No online teachers found. Creating missed call notifications.");

      const allTeachers = await User.find({
        knownLanguages: language,
        _id: { $ne: caller._id },
      });

      if (allTeachers.length > 0) {
        const upsertPromises = allTeachers.map(teacher => {
          const filter = {
            caller: caller._id,
            intendedReceiver: teacher._id,
            language: language,
            status: 'pending' // Only check against pending calls
          };
          const update = { $set: { updatedAt: new Date() } }; // Just update timestamp if it exists
          const options = { upsert: true, new: true }; // upsert: create if not found

          return MissedCall.findOneAndUpdate(filter, update, options);
        });
        await Promise.all(upsertPromises);
        console.log(`Ensured missed call notifications exist for ${allTeachers.length} teachers.`);
      }

      return res.status(202).json({
        message: `No online teachers found for ${language}. We've notified them and will let you know when one becomes available.`,
      });
      // --- END MODIFIED LOGIC ---
    }

    const call = new Call({
      caller: caller._id,
      language,
      potentialReceivers: potentialReceivers.map(r => r._id),
      status: "pending",
      startTime: new Date()
    });

    await call.save();
    caller.currentCall = call._id;
    await caller.save();
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
// exports.initiateCall = async (req, res) => {
//   try {
//     console.log('Initiate call - Request body:', req.body);
//     console.log('Initiate call - User:', req.user);

//     const caller = req.user;
//     const { language } = req.body;

//     if (!caller) return res.status(401).json({ error: "User not authenticated" });
//     if (!language || typeof language !== 'string') {
//       return res.status(400).json({ error: "Language must be a string" });
//     }
//     if (typeof caller.powerTokens !== 'number' || caller.powerTokens < 1) {
//       return res.status(400).json({ error: "Insufficient power tokens" });
//     }

//     const potentialReceivers = await User.find({
//       knownLanguages: language,
//       _id: { $ne: caller._id },
//       isOnline: true,
//     });
//     console.log('Potential online receivers:', potentialReceivers.map(r => ({ id: r._id, name: r.name })));

//     if (potentialReceivers.length === 0) {
//       // --- NEW LOGIC STARTS HERE ---
//       console.log("No online teachers found. Creating missed call notifications.");

//       const offlineTeachers = await User.find({
//         knownLanguages: language,
//         _id: { $ne: caller._id },
//         isOnline: false,
//       });

//       if (offlineTeachers.length > 0) {
//         const missedCallPromises = offlineTeachers.map(teacher => {
//           return MissedCall.create({
//             caller: caller._id,
//             intendedReceiver: teacher._id,
//             language: language,
//           });
//         });
//         await Promise.all(missedCallPromises);
//         console.log(`Created ${offlineTeachers.length} missed call notifications.`);
//       }

//       // Return a special success status (202 Accepted) to indicate the request was handled
//       // but no immediate call was started.
//       return res.status(202).json({
//         message: `No online teachers found for ${language}. We've notified them and will let you know when one becomes available.`,
//       });
//       // --- NEW LOGIC ENDS HERE ---
//     }

//     // --- Existing logic for when receivers ARE found ---
//     const call = new Call({
//       caller: caller._id,
//       language,
//       potentialReceivers: potentialReceivers.map(r => r._id),
//       status: "pending",
//       startTime: new Date()
//     });

//     await call.save();
//     caller.currentCall = call._id;
//     await caller.save();
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
      caller.currentCall = null;
      await caller.save();
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
    caller.currentCall = call._id;
    receiver.currentCall = call._id;
    await caller.save();
    await receiver.save();
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
        updatedCall.caller.currentCall = null;
        updatedCall.receiver.currentCall = null;
        await updatedCall.caller.save();
        await updatedCall.receiver.save();
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
    console.log('Updated potential receivers:', call.potentialReceivers.map(id => id.toString()));

    if (call.potentialReceivers.length === 0) {
      call.status = "cancelled";
      call.caller.currentCall = null;
      await call.caller.save();
      console.log('No receivers left, call cancelled:', call._id.toString());
    } else {
      console.log('Receivers remain, call stays pending:', call._id.toString());
    }
    await call.save();

    receiver.rejectedCalls = receiver.rejectedCalls || [];
    if (!receiver.rejectedCalls.includes(call._id)) {
      receiver.rejectedCalls.push(call._id);
      await receiver.save();
      console.log(`Added call ${call._id} to ${receiver.name}'s rejectedCalls`);
    }

    const io = socket.getIO();
    io.to(call.caller._id.toString()).emit("call-rejected", {
      callId: call._id.toString(),
      receiverId: receiver._id.toString(),
      receiverName: receiver.name,
      remainingReceivers: call.potentialReceivers.length
    });
    console.log(`Emitted call-rejected to caller ${call.caller._id} with ${call.potentialReceivers.length} receivers left`);

    if (call.potentialReceivers.length > 0) {
      call.potentialReceivers.forEach((receiverId) => {
        io.to(receiverId.toString()).emit("call-still-pending", {
          callId: call._id.toString(),
          callerId: call.caller._id.toString(),
          callerName: call.caller.name,
          language: call.language
        });
        console.log(`Emitted call-still-pending to ${receiverId}`);
      });
    }

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
    call.caller.currentCall = null;
    if (call.receiver) call.receiver.currentCall = null;
    await call.caller.save();
    if (call.receiver) await call.receiver.save();
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
    caller.currentCall = null;
    await caller.save();
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

    let call = await Call.findById(user.currentCall)
      .populate('caller', 'name')
      .populate('receiver', 'name')
      .populate('potentialReceivers', 'name');

    if (!call) {
      call = await Call.findOne({
        status: "pending",
        potentialReceivers: user._id,
      })
        .populate('caller', 'name')
        .populate('receiver', 'name')
        .populate('potentialReceivers', 'name');
    }

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

exports.initiateSelectiveCall = async (req, res) => {
  try {
    console.log('Initiate selective call - Request body:', req.body);
    console.log('Initiate selective call - User:', req.user);

    const caller = req.user;
    const { receiverId, language } = req.body;

    if (!caller || !caller.premium) return res.status(403).json({ error: "Premium access required" });
    if (!receiverId) return res.status(400).json({ error: "Receiver ID required" });
    if (caller.powerTokens < 1) return res.status(400).json({ error: "Insufficient power tokens" });

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.isOnline) return res.status(404).json({ error: "Receiver not found or offline" });

    const call = new Call({
      caller: caller._id,
      receiver: receiver._id,
      potentialReceivers: [receiver._id],
      language: language || "Not specified",
      status: "pending",
      startTime: new Date(),
    });

    await call.save();
    caller.currentCall = call._id;
    await caller.save();
    console.log('Selective call saved:', call._id.toString());

    const io = socket.getIO();
    io.to(receiver._id.toString()).emit("call-request", {
      callId: call._id.toString(),
      callerId: caller._id.toString(),
      callerName: caller.name,
      language: call.language,
    });
    console.log(`Emitted call-request to ${receiver.name} (${receiver._id})`);

    res.status(200).json({ callId: call._id.toString(), receiver: { id: receiver._id.toString(), name: receiver.name } });
  } catch (error) {
    console.error("Initiate selective call error:", error.stack);
    res.status(500).json({ error: "Failed to initiate selective call", details: error.message });
  }
};

module.exports = exports;
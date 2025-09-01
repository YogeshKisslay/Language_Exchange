// const mongoose = require("mongoose");

// const missedCallSchema = new mongoose.Schema(
//   {
//     caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     intendedReceiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     language: { type: String, required: true },
//     status: {
//       type: String,
//       enum: ["pending", "dismissed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// // Create a TTL index to automatically delete documents after 7 days
// missedCallSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days in seconds

// module.exports = mongoose.model("MissedCall", missedCallSchema);

const mongoose = require("mongoose");

const missedCallSchema = new mongoose.Schema(
  {
    caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    intendedReceiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "dismissed"],
      default: "pending",
    },
    // --- ADDED THIS FIELD ---
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Create a TTL index to automatically delete documents after 7 days
missedCallSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 }); // 7 days in seconds

module.exports = mongoose.model("MissedCall", missedCallSchema);
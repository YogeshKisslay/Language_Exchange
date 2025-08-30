

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function () { return !this.googleId; } },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    knownLanguages: { type: [String], default: [] }, // Fixed default
    learnLanguages: { type: [String], default: [] }, // Fixed default
    powerTokens: { type: Number, default: 10, max: 10 },
    coinTokens: { type: Number, default: 0 },
    lastTokenGeneration: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    rejectedCalls: [{ type: mongoose.Schema.Types.ObjectId, ref: "Call", default: [] }], // Track rejected calls
    currentCall: { type: mongoose.Schema.Types.ObjectId, ref: "Call", default: null } ,// Track active/pending call
    premium: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
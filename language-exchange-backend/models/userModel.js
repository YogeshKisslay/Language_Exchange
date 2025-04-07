// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   isVerified: { type: Boolean, default: false },
//   googleId: { type: String, default: null },
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);



// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: function () { return !this.googleId; } }, // ✅ Required only if no googleId
//     isVerified: { type: Boolean, default: false },
//     googleId: { type: String, default: null },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);


// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: function () { return !this.googleId; } },
//     isVerified: { type: Boolean, default: false },
//     googleId: { type: String, default: null },
//     knownLanguages: [{ type: String, default: [] }], // Languages the user knows
//     learnLanguages: [{ type: String, default: [] }], // Languages the user wants to learn
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);


// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: function () { return !this.googleId; } },
//     isVerified: { type: Boolean, default: false },
//     googleId: { type: String, default: null },
//     knownLanguages: [{ type: String, default: [] }], // Languages the user knows
//     learnLanguages: [{ type: String, default: [] }], // Languages the user wants to learn
//     powerTokens: { type: Number, default: 10, max: 10 }, // Auto-generated every 2 hours
//     coinTokens: { type: Number, default: 0 }, // Earned through completed calls
//     lastTokenGeneration: { type: Date, default: Date.now } // For power token generation
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User",userSchema);


// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: function () { return !this.googleId; } },
//     isVerified: { type: Boolean, default: false },
//     googleId: { type: String, default: null },
//     knownLanguages: [{ type: String, default: [] }],
//     learnLanguages: [{ type: String, default: [] }],
//     powerTokens: { type: Number, default: 10, max: 10 },
//     coinTokens: { type: Number, default: 0 },
//     lastTokenGeneration: { type: Date, default: Date.now },
//     isOnline: { type: Boolean, default: false }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);


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
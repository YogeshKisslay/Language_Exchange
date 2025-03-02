// const mongoose = require("mongoose");

// const callSchema = new mongoose.Schema({
//   caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
//   language: { type: String, required: true },
//   startTime: { type: Date, default: Date.now },
//   endTime: { type: Date },
//   duration: { type: Number }, // in seconds
//   extended: { type: Boolean, default: false },
//   status: { 
//     type: String, 
//     enum: ["pending", "active", "completed", "disconnected"], 
//     default: "pending" 
//   }
// });

// module.exports = mongoose.model("Call",callSchema);


const mongoose = require("mongoose");

const callSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  potentialReceivers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  language: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number },
  extended: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "active", "completed", "disconnected", "cancelled"],
    default: "pending"
  }
});

module.exports = mongoose.model("Call", callSchema);
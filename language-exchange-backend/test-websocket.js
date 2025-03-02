const io = require("socket.io-client");

// Simulate Tanishjot (receiver)
const tanishjotSocket = io("http://localhost:5000");
tanishjotSocket.on("connect", () => {
  console.log("Tanishjot connected:", tanishjotSocket.id);
  tanishjotSocket.emit("register", "67c32412e026a769648500eb"); // Tanishjot's _id
});

tanishjotSocket.on("call-request", (data) => {
  console.log("Tanishjot received call request:", data);
});

tanishjotSocket.on("call-cancelled", (data) => {
  console.log("Tanishjot call cancelled:", data);
});

// Simulate Yogesh Kont (caller)
const yogeshSocket = io("http://localhost:5000");
yogeshSocket.on("connect", () => {
  console.log("Yogesh connected:", yogeshSocket.id);
  yogeshSocket.emit("register", "67c31e20f6ab4d292ef299db"); // Yogesh's _id
});

yogeshSocket.on("call-accepted", (data) => {
  console.log("Yogesh call accepted:", data);
});

yogeshSocket.on("call-ended", (data) => {
  console.log("Yogesh call ended:", data);
});
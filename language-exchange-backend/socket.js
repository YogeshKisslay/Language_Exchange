const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: { origin: process.env.FRONTEND_URL, credentials: true }
    });

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      socket.on("register", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} registered with socket ${socket.id}`);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
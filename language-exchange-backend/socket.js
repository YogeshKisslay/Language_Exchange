// const { Server } = require("socket.io");

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: { origin: process.env.FRONTEND_URL, credentials: true }
//     });

//     io.on("connection", (socket) => {
//       console.log("User connected:", socket.id);

//       socket.on("register", (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error("Socket.io not initialized!");
//     }
//     return io;
//   }
// };

// const { Server } = require("socket.io");

// module.exports = {
//   init: (httpServer) => {
//     const io = new Server(httpServer, {
//       cors: { origin: process.env.FRONTEND_URL, credentials: true },
//     });

//     io.on("connection", (socket) => {
//       console.log("User connected:", socket.id);

//       socket.on("register", (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       // New WebRTC signaling events
//       socket.on("offer", ({ callId, offer, to }) => {
//         io.to(to).emit("offer", { callId, offer, from: socket.id });
//       });

//       socket.on("answer", ({ callId, answer, to }) => {
//         io.to(to).emit("answer", { callId, answer });
//       });

//       socket.on("ice-candidate", ({ callId, candidate, to }) => {
//         io.to(to).emit("ice-candidate", { callId, candidate });
//       });

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) throw new Error("Socket.io not initialized!");
//     return io;
//   },
// };


// const { Server } = require('socket.io');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: 'http://localhost:3000', // Adjust to your frontend URL
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error('Socket.IO not initialized!');
//     }
//     return io;
//   },
// };


// const { Server } = require('socket.io');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: 'http://localhost:3000', // Adjust to your frontend URL
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       // Add WebRTC event handlers with logging
//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.to, 'Sending to:', data.from, 'Call ID:', data.callId);
//         io.to(data.from).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error('Socket.IO not initialized!');
//     }
//     return io;
//   },
// };















// const { Server } = require('socket.io');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: 'http://localhost:3000', // Adjust to your frontend URL
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       // Add WebRTC event handlers with logging
//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error('Socket.IO not initialized!');
//     }
//     return io;
//   },
// };

// const { Server } = require('socket.io');
// const Call = require('./models/callModel'); // Import Call model for database queries

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: 'http://localhost:3000', // Adjust to your frontend URL
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       // WebRTC event handlers with logging
//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       // Handle call refresh for browser reloads
//       socket.on('call-refresh', async ({ callId, userId }) => {
//         console.log(`Call refresh from ${userId} for call ${callId}`);
//         try {
//           const call = await Call.findById(callId).populate('caller receiver');
//           if (call && call.status === 'active') {
//             const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
//             io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
//             console.log(`Emitted call-refreshing to ${otherUserId}`);
//           } else {
//             console.log(`Call ${callId} not active or not found`);
//           }
//         } catch (error) {
//           console.error('Error handling call-refresh:', error.stack);
//         }
//       });

//       socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error('Socket.IO not initialized!');
//     }
//     return io;
//   },
// };



// const { Server } = require('socket.io');
// const Call = require('./models/callModel'); // Import Call model for database queries

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: 'http://localhost:3000', // Adjust to your frontend URL
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       // WebRTC event handlers with logging
//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       // Handle call refresh for browser reloads
//       socket.on('call-refresh', async ({ callId, userId }) => {
//         console.log(`Call refresh from ${userId} for call ${callId}`);
//         try {
//           const call = await Call.findById(callId).populate('caller receiver');
//           if (call && call.status === 'active') {
//             const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
//             io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
//             console.log(`Emitted call-refreshing to ${otherUserId}`);
//           } else {
//             console.log(`Call ${callId} not active or not found`);
//           }
//         } catch (error) {
//           console.error('Error handling call-refresh:', error.stack);
//         }
//       });

//       socket.on('disconnect', async () => {
//         console.log('User disconnected:', socket.id);
//         try {
//           // Check for active calls involving this socket's user
//           const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
//           if (userRooms.length > 0) {
//             const userId = userRooms[0]; // Assumes first room is userId from 'register'
//             const activeCall = await Call.findOne({
//               $or: [{ caller: userId }, { receiver: userId }],
//               status: 'active',
//             }).populate('caller receiver');
//             if (activeCall) {
//               const otherUserId = activeCall.caller._id.toString() === userId ? activeCall.receiver._id : activeCall.caller._id;
//               io.to(otherUserId.toString()).emit('call-disconnected', {
//                 callId: activeCall._id,
//                 userId,
//                 reason: 'User disconnected unexpectedly',
//               });
//               console.log(`Notified ${otherUserId} of disconnect for call ${activeCall._id}`);
//             }
//           }
//         } catch (error) {
//           console.error('Error handling disconnect:', error.stack);
//         }
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) {
//       throw new Error('Socket.IO not initialized!');
//     }
//     return io;
//   },
// };




// const { Server } = require('socket.io');
// const Call = require('./models/callModel');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       // cors: {
//       //   // origin: 'http://localhost:3000',
//       //   // origin: '*',
//       //   methods: ['GET', 'POST'],
//       //   credentials: true,
//       // },
//       cors: {
//         origin: [
//           'http://localhost:3000', // Updated Vite local dev port
//           'https://language-exchange-frontend.onrender.com',
//         ],
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       socket.on('call-refresh', async ({ callId, userId }) => {
//         console.log(`Call refresh from ${userId} for call ${callId}`);
//         try {
//           const call = await Call.findById(callId).populate('caller receiver');
//           if (call && call.status === 'active') {
//             const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
//             io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
//             // If receiver refreshes, prompt caller to renegotiate
//             if (call.receiver._id.toString() === userId) {
//               io.to(call.caller._id.toString()).emit('call-reconnect', { callId, userId });
//               console.log(`Prompting caller ${call.caller._id} to reconnect for call ${callId}`);
//             }
//             console.log(`Emitted call-refreshing to ${otherUserId}`);
//           } else {
//             console.log(`Call ${callId} not active or not found`);
//           }
//         } catch (error) {
//           console.error('Error handling call-refresh:', error.stack);
//         }
//       });

//       socket.on('disconnect', async () => {
//         console.log('User disconnected:', socket.id);
//         try {
//           const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
//           if (userRooms.length > 0) {
//             const userId = userRooms[0];
//             const activeCall = await Call.findOne({
//               $or: [{ caller: userId }, { receiver: userId }],
//               status: 'active',
//             }).populate('caller receiver');
//             if (activeCall) {
//               const otherUserId = activeCall.caller._id.toString() === userId ? activeCall.receiver._id : activeCall.caller._id;
//               io.to(otherUserId.toString()).emit('call-disconnected', {
//                 callId: activeCall._id,
//                 userId,
//                 reason: 'User disconnected unexpectedly',
//               });
//               console.log(`Notified ${otherUserId} of disconnect for call ${activeCall._id}`);
//             }
//           }
//         } catch (error) {
//           console.error('Error handling disconnect:', error.stack);
//         }
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) throw new Error('Socket.IO not initialized!');
//     return io;
//   },
// };



// const { Server } = require('socket.io');
// const Call = require('./models/callModel');
// const User = require('./models/userModel');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: [
//           'http://localhost:3000',
//           'https://language-exchange-frontend.onrender.com',
//         ],
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     const heartbeatTimeouts = new Map();

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         socket.userId = userId;
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       socket.on('heartbeat', (userId) => {
//         clearTimeout(heartbeatTimeouts.get(userId));
//         heartbeatTimeouts.set(
//           userId,
//           setTimeout(async () => {
//             try {
//               const user = await User.findById(userId);
//               if (user && user.isOnline) {
//                 user.isOnline = false;
//                 await user.save();
//                 io.to(userId).emit('online-status', { status: 'offline' });
//                 console.log(`User ${userId} set offline due to missed heartbeat`);
//               }
//             } catch (error) {
//               console.error('Error in heartbeat timeout:', error.stack);
//             }
//             heartbeatTimeouts.delete(userId);
//           }, 45000) // 45 seconds timeout
//         );
//       });

//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       socket.on('call-refresh', async ({ callId, userId }) => {
//         console.log(`Call refresh from ${userId} for call ${callId}`);
//         try {
//           const call = await Call.findById(callId).populate('caller receiver');
//           if (call && call.status === 'active') {
//             const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
//             io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
//             if (call.receiver._id.toString() === userId) {
//               io.to(call.caller._id.toString()).emit('call-reconnect', { callId, userId });
//               console.log(`Prompting caller ${call.caller._id} to reconnect for call ${callId}`);
//             }
//             console.log(`Emitted call-refreshing to ${otherUserId}`);
//           } else {
//             console.log(`Call ${callId} not active or not found`);
//           }
//         } catch (error) {
//           console.error('Error handling call-refresh:', error.stack);
//         }
//       });

//       socket.on('disconnect', async () => {
//         console.log('User disconnected:', socket.id);
//         if (socket.userId) {
//           clearTimeout(heartbeatTimeouts.get(socket.userId));
//           heartbeatTimeouts.delete(socket.userId);
//           try {
//             const user = await User.findById(socket.userId);
//             if (user) {
//               user.isOnline = false;
//               await user.save();
//               io.to(socket.userId).emit('online-status', { status: 'offline' });
//               console.log(`User ${socket.userId} set to offline due to socket disconnect`);
//             }

//             const activeCall = await Call.findOne({
//               $or: [{ caller: socket.userId }, { receiver: socket.userId }],
//               status: 'active',
//             }).populate('caller receiver');
//             if (activeCall) {
//               const otherUserId = activeCall.caller._id.toString() === socket.userId ? activeCall.receiver._id : activeCall.caller._id;
//               io.to(otherUserId.toString()).emit('call-disconnected', {
//                 callId: activeCall._id,
//                 userId: socket.userId,
//                 reason: 'User disconnected unexpectedly',
//               });
//               console.log(`Notified ${otherUserId} of disconnect for call ${activeCall._id}`);
//             }
//           } catch (error) {
//             console.error('Error handling disconnect:', error.stack);
//           }
//         }
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) throw new Error('Socket.IO not initialized!');
//     return io;
//   },
// };


// const { Server } = require('socket.io');
// const Call = require('./models/callModel');
// const User = require('./models/userModel');

// let io;

// module.exports = {
//   init: (httpServer) => {
//     io = new Server(httpServer, {
//       cors: {
//         origin: [
//           'http://localhost:3000',
//           'https://language-exchange-frontend.onrender.com',
//         ],
//         methods: ['GET', 'POST'],
//         credentials: true,
//       },
//     });

//     const heartbeatTimeouts = new Map();

//     io.on('connection', (socket) => {
//       console.log('User connected:', socket.id);

//       socket.on('register', (userId) => {
//         socket.join(userId);
//         socket.userId = userId;
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//       });

//       socket.on('heartbeat', (userId) => {
//         clearTimeout(heartbeatTimeouts.get(userId));
//         heartbeatTimeouts.set(
//           userId,
//           setTimeout(async () => {
//             try {
//               const user = await User.findById(userId);
//               if (user && user.isOnline) {
//                 user.isOnline = false;
//                 await user.save();
//                 io.to(userId).emit('online-status', { status: 'offline' });
//                 console.log(`User ${userId} set offline due to missed heartbeat`);

//                 const activeCall = await Call.findOne({
//                   $or: [{ caller: userId }, { receiver: userId }],
//                   status: 'active',
//                 }).populate('caller receiver');
//                 if (activeCall) {
//                   const otherUserId = activeCall.caller._id.toString() === userId ? activeCall.receiver._id : activeCall.caller._id;
//                   io.to(otherUserId.toString()).emit('call-disconnected', {
//                     callId: activeCall._id,
//                     userId,
//                     reason: 'User disconnected unexpectedly',
//                   });
//                   console.log(`Notified ${otherUserId} of disconnect for call ${activeCall._id}`);
//                 }
//               }
//             } catch (error) {
//               console.error('Error in heartbeat timeout:', error.stack);
//             }
//             heartbeatTimeouts.delete(userId);
//           }, 45000)
//         );
//       });

//       socket.on('offer', (data) => {
//         console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
//       });

//       socket.on('answer', (data) => {
//         console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
//       });

//       socket.on('ice-candidate', (data) => {
//         console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
//         io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
//       });

//       socket.on('call-refresh', async ({ callId, userId }) => {
//         console.log(`Call refresh from ${userId} for call ${callId}`);
//         try {
//           const call = await Call.findById(callId).populate('caller receiver');
//           if (call && call.status === 'active') {
//             const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
//             io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
//             io.to(call.caller._id.toString()).emit('call-reconnect', { callId, userId });
//             console.log(`Prompting caller ${call.caller._id} to reconnect for call ${callId}`);
//           } else {
//             console.log(`Call ${callId} not active or not found`);
//           }
//         } catch (error) {
//           console.error('Error handling call-refresh:', error.stack);
//         }
//       });

//       socket.on('disconnect', async () => {
//         console.log('User disconnected:', socket.id);
//         if (socket.userId) {
//           clearTimeout(heartbeatTimeouts.get(socket.userId));
//           heartbeatTimeouts.delete(socket.userId);
//           try {
//             const user = await User.findById(socket.userId);
//             if (user) {
//               user.isOnline = false;
//               await user.save();
//               io.to(socket.userId).emit('online-status', { status: 'offline' });
//               console.log(`User ${socket.userId} set to offline due to socket disconnect`);
//             }
//           } catch (error) {
//             console.error('Error handling disconnect:', error.stack);
//           }
//         }
//       });
//     });

//     return io;
//   },
//   getIO: () => {
//     if (!io) throw new Error('Socket.IO not initialized!');
//     return io;
//   },
// };


const { Server } = require('socket.io');
const Call = require('./models/callModel');
const User = require('./models/userModel');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          'http://localhost:3000',
          'https://language-exchange-frontend.onrender.com',
        ],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    const heartbeatTimeouts = new Map();

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('register', async (userId) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`User ${userId} registered with socket ${socket.id}`);
        try {
          const user = await User.findById(userId);
          if (user && !user.isOnline) {
            user.isOnline = true;
            await user.save();
            io.to(userId).emit('online-status', { status: 'online' });
            // Broadcast to all connected clients (optional, adjust as needed)
            io.emit('user-online', { userId, status: 'online' });
            console.log(`User ${userId} set online on connection`);
          }
        } catch (error) {
          console.error('Error registering user:', error.stack);
        }
      });

      socket.on('heartbeat', (userId) => {
        clearTimeout(heartbeatTimeouts.get(userId));
        heartbeatTimeouts.set(
          userId,
          setTimeout(async () => {
            try {
              const user = await User.findById(userId);
              if (user && user.isOnline) {
                user.isOnline = false;
                await user.save();
                io.to(userId).emit('online-status', { status: 'offline' });
                console.log(`User ${userId} set offline due to missed heartbeat`);

                const activeCall = await Call.findOne({
                  $or: [{ caller: userId }, { receiver: userId }],
                  status: 'active',
                }).populate('caller receiver');
                if (activeCall) {
                  const otherUserId = activeCall.caller._id.toString() === userId ? activeCall.receiver._id : activeCall.caller._id;
                  io.to(otherUserId.toString()).emit('call-disconnected', {
                    callId: activeCall._id,
                    userId,
                    reason: 'User disconnected unexpectedly',
                  });
                  console.log(`Notified ${otherUserId} of disconnect for call ${activeCall._id}`);
                }
              }
            } catch (error) {
              console.error('Error in heartbeat timeout:', error.stack);
            }
            heartbeatTimeouts.delete(userId);
          }, 45000)
        );
      });

      socket.on('offer', (data) => {
        console.log('Received offer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
        io.to(data.to).emit('offer', { callId: data.callId, offer: data.offer, from: data.from });
      });

      socket.on('answer', (data) => {
        console.log('Received answer from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
        io.to(data.to).emit('answer', { callId: data.callId, answer: data.answer });
      });

      socket.on('ice-candidate', (data) => {
        console.log('Received ICE candidate from:', data.from, 'Sending to:', data.to, 'Call ID:', data.callId);
        io.to(data.to).emit('ice-candidate', { callId: data.callId, candidate: data.candidate });
      });

      socket.on('call-refresh', async ({ callId, userId }) => {
        console.log(`Call refresh from ${userId} for call ${callId}`);
        try {
          const call = await Call.findById(callId).populate('caller receiver');
          if (call && call.status === 'active') {
            const otherUserId = call.caller._id.toString() === userId ? call.receiver._id : call.caller._id;
            io.to(otherUserId.toString()).emit('call-refreshing', { callId, userId });
            io.to(call.caller._id.toString()).emit('call-reconnect', { callId, userId });
            console.log(`Prompting caller ${call.caller._id} to reconnect for call ${callId}`);
          } else {
            console.log(`Call ${callId} not active or not found`);
          }
        } catch (error) {
          console.error('Error handling call-refresh:', error.stack);
        }
      });

      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          clearTimeout(heartbeatTimeouts.get(socket.userId));
          heartbeatTimeouts.delete(socket.userId);
          try {
            const user = await User.findById(socket.userId);
            if (user && user.isOnline) {
              user.isOnline = false;
              await user.save();
              io.to(socket.userId).emit('online-status', { status: 'offline' });
              // Broadcast to all connected clients (optional)
              io.emit('user-online', { userId: socket.userId, status: 'offline' });
              console.log(`User ${socket.userId} set to offline due to socket disconnect`);
            }
          } catch (error) {
            console.error('Error handling disconnect:', error.stack);
          }
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error('Socket.IO not initialized!');
    return io;
  },
};
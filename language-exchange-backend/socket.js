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




const { Server } = require('socket.io');
const Call = require('./models/callModel');

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: 'http://localhost:3000',
        // origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('register', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} registered with socket ${socket.id}`);
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
            // If receiver refreshes, prompt caller to renegotiate
            if (call.receiver._id.toString() === userId) {
              io.to(call.caller._id.toString()).emit('call-reconnect', { callId, userId });
              console.log(`Prompting caller ${call.caller._id} to reconnect for call ${callId}`);
            }
            console.log(`Emitted call-refreshing to ${otherUserId}`);
          } else {
            console.log(`Call ${callId} not active or not found`);
          }
        } catch (error) {
          console.error('Error handling call-refresh:', error.stack);
        }
      });

      socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        try {
          const userRooms = Array.from(socket.rooms).filter(room => room !== socket.id);
          if (userRooms.length > 0) {
            const userId = userRooms[0];
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
          console.error('Error handling disconnect:', error.stack);
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
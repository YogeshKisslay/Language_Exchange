
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

//       socket.on('register', async (userId) => {
//         socket.join(userId);
//         socket.userId = userId;
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//         try {
//           const user = await User.findById(userId);
//           if (user && !user.isOnline) {
//             user.isOnline = true;
//             await user.save();
//             io.to(userId).emit('online-status', { status: 'online' });
//             // Broadcast to all connected clients (optional, adjust as needed)
//             io.emit('user-online', { userId, status: 'online' });
//             console.log(`User ${userId} set online on connection`);
//           }
//         } catch (error) {
//           console.error('Error registering user:', error.stack);
//         }
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
//             if (user && user.isOnline) {
//               user.isOnline = false;
//               await user.save();
//               io.to(socket.userId).emit('online-status', { status: 'offline' });
//               // Broadcast to all connected clients (optional)
//               io.emit('user-online', { userId: socket.userId, status: 'offline' });
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

// const { Server } = require('socket.io');
// const Call = require('./models/callModel');
// const User = require('./models/userModel');
// const MissedCall = require('./models/missedCallModel');
// const { sendEmailService } = require('./services/emailService');

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

//       socket.on('register', async (userId) => {
//         socket.join(userId);
//         socket.userId = userId;
//         console.log(`User ${userId} registered with socket ${socket.id}`);
//         try {
//           const user = await User.findById(userId);
//           if (user && !user.isOnline) {
//             user.isOnline = true;
//             await user.save();
//             io.to(userId).emit('online-status', { status: 'online' });
//             io.emit('user-online', { userId, status: 'online' });
//             console.log(`User ${userId} set online on connection`);
            
//             // --- NEW NOTIFICATION LOGIC ---
//             const missedCallsForUser = await MissedCall.find({
//               intendedReceiver: userId,
//               status: 'pending',
//             }).populate('caller', 'name email');

//             if (missedCallsForUser.length > 0) {
//               io.to(userId).emit('missed-call-alert', { count: missedCallsForUser.length });
              
//               const notificationPromises = missedCallsForUser.map(mc => {
//                 return sendEmailService({
//                   to: mc.caller.email,
//                   subject: `A user is now available for ${mc.language}!`,
//                   text: `Hello ${mc.caller.name},\n\nGood news! ${user.name}, who speaks ${mc.language}, is now online.\n\nYou can try calling them from the app.\n\n- The Language Exchange Team`,
//                 });
//               });
//               await Promise.all(notificationPromises);
//               console.log(`Sent ${missedCallsForUser.length} online-availability emails.`);
//             }
//             // --- END NEW NOTIFICATION LOGIC ---
//           }
//         } catch (error) {
//           console.error('Error registering user:', error.stack);
//         }
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
//             if (user && user.isOnline) {
//               user.isOnline = false;
//               await user.save();
//               io.to(socket.userId).emit('online-status', { status: 'offline' });
//               io.emit('user-online', { userId: socket.userId, status: 'offline' });
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
const MissedCall = require('./models/missedCallModel');
const { sendEmailService } = require('./services/emailService');

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

      // socket.on('register', async (userId) => {
      //   socket.join(userId);
      //   socket.userId = userId;
      //   console.log(`User ${userId} registered with socket ${socket.id}`);
      //   try {
      //     const user = await User.findById(userId);
      //     if (user && !user.isOnline) {
      //       user.isOnline = true;
      //       await user.save();
      //       io.to(userId).emit('online-status', { status: 'online' });
      //       io.emit('user-online', { userId, status: 'online' });
      //       console.log(`User ${userId} set online on connection`);
            
      //       // --- MODIFIED NOTIFICATION LOGIC ---
      //       console.log(`[Missed Calls] Checking for user ${userId}...`); // <-- ADDED LOGGING
      //       const missedCallsForUser = await MissedCall.find({
      //         intendedReceiver: userId,
      //         status: 'pending',
      //       }).populate('caller', 'name email');

      //       console.log(`[Missed Calls] Found ${missedCallsForUser.length} pending calls for ${user.name}.`); // <-- ADDED LOGGING

      //       if (missedCallsForUser.length > 0) {
      //         // Notify the user who just logged in that they have missed calls
      //         io.to(userId).emit('missed-call-alert', { count: missedCallsForUser.length });
      //         console.log(`[Missed Calls] Emitted 'missed-call-alert' to ${userId}.`); // <-- ADDED LOGGING
              
      //         const notificationPromises = missedCallsForUser.map(mc => {
      //           if (!mc.caller || !mc.caller.email) {
      //             console.error(`[Email Notify] Missed call ${mc._id} is missing caller details. Skipping.`); // <-- ADDED LOGGING
      //             return Promise.resolve();
      //           }
                
      //           console.log(`[Email Notify] Preparing to email ${mc.caller.email} about ${user.name} being online.`); // <-- ADDED LOGGING
      //           return sendEmailService({
      //             to: mc.caller.email,
      //             subject: `A user is now available for ${mc.language}!`,
      //             text: `Hello ${mc.caller.name},\n\nGood news! ${user.name}, who speaks ${mc.language}, is now online.\n\nYou can try calling them from the app.\n\n- The Language Exchange Team`,
      //           });
      //         });
      //         await Promise.all(notificationPromises);
      //         console.log(`[Email Notify] Finished processing ${missedCallsForUser.length} email notifications.`); // <-- ADDED LOGGING
      //       }
      //       // --- END MODIFIED NOTIFICATION LOGIC ---
      //     }
      //   } catch (error) {
      //     console.error('[Missed Calls] Error during user registration logic:', error.stack); // <-- MODIFIED LOGGING
      //   }
      // });


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
            io.emit('user-online', { userId, status: 'online' });
            console.log(`User ${userId} set online on connection`);
            
            // --- UPDATED NOTIFICATION LOGIC TO PREVENT SPAM ---
            const missedCallsForUser = await MissedCall.find({
              intendedReceiver: userId,
              status: 'pending',
              notificationSent: false, // <-- Only get calls we haven't notified for yet
            }).populate('caller', 'name email');

            if (missedCallsForUser.length > 0) {
              console.log(`[Missed Calls] Found ${missedCallsForUser.length} un-notified calls for ${user.name}.`);
              
              io.to(userId).emit('missed-call-alert', { count: missedCallsForUser.length });
              
              const notificationPromises = missedCallsForUser.map(mc => {
                if (!mc.caller || !mc.caller.email) {
                  console.error(`[Email Notify] Missed call ${mc._id} is missing caller details. Skipping.`);
                  return Promise.resolve();
                }
                
                console.log(`[Email Notify] Preparing to email ${mc.caller.email} about ${user.name} being online.`);
                return sendEmailService({
                  to: mc.caller.email,
                  subject: `A user is now available for ${mc.language}!`,
                  text: `Hello ${mc.caller.name},\n\nGood news! ${user.name}, who speaks ${mc.language}, is now online.\n\nYou can try calling them from the app.\n\n- The Language Exchange Team`,
                });
              });

              await Promise.all(notificationPromises);
              
              // --- MARK THESE NOTIFICATIONS AS SENT ---
              const idsToUpdate = missedCallsForUser.map(mc => mc._id);
              await MissedCall.updateMany(
                { _id: { $in: idsToUpdate } },
                { $set: { notificationSent: true } }
              );
              console.log(`[Email Notify] Marked ${idsToUpdate.length} notifications as sent.`);
            }
          }
        } catch (error) {
          console.error('[Missed Calls] Error during user registration logic:', error.stack);
        }
      });
      // ... (rest of the socket.js file is unchanged)
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
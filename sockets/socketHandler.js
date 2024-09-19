import mongoose from "mongoose";
import Message from "../models/Message.js";

const connectedUsers = {}; // Track connected users

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a room based on their user ID
    socket.on("join", async ({ userId }) => {
      if (userId) {
        socket.join(userId);
        if (!connectedUsers[userId]) {
          connectedUsers[userId] = new Set();
        }
        connectedUsers[userId].add(socket.id);

        // Emit full list of online users
        io.emit("onlineUsers", Object.keys(connectedUsers));
        console.log(`User ${userId} joined room with ID: ${userId}`);

        // Update status of undelivered messages to 'delivered'
        const undeliveredMessages = await Message.find(
          { receiver: userId, status: { $in: ['sent', 'delivered'] } }
        );

        if (undeliveredMessages.length > 0) {
          await Message.updateMany(
            { receiver: userId, status: { $in: ['sent', 'delivered'] } },
            { status: 'delivered' }
          );

          // Notify sender about the updated status
          undeliveredMessages.forEach((msg) => {
            io.to(msg.sender.toString()).emit('messageStatusUpdate', {
              messageId: msg._id,
              status: 'delivered',
            });
          });
        }
      } else {
        console.log("Invalid userId for joining room");
      }
    });

    // Handling sending messages
    socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
      try {
        if (
          !mongoose.Types.ObjectId.isValid(senderId) ||
          !mongoose.Types.ObjectId.isValid(receiverId)
        ) {
          console.error("Invalid senderId or receiverId");
          return;
        }

        // Save the message to the database
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          status: connectedUsers[receiverId] ? 'delivered' : 'sent',
        });
        await message.save();

        // Emit message to both sender and receiver
        io.to(receiverId).emit("newMessage", message);
        io.to(senderId).emit("newMessage", message);
        console.log(`Message sent from ${senderId} to ${receiverId}`);

        // Update message status to delivered if receiver is online
        if (connectedUsers[receiverId]) {
          await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
          io.to(senderId).emit('messageStatusUpdate', { messageId: message?._id, status: 'delivered' });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle "message seen" event
    socket.on("messageSeen", async ({ messageId, seenBy }) => {
      try {
        let messageIds = Array.isArray(messageId) ? messageId : [messageId];
        console.log(seenBy, "messageIds:", messageIds);

        if (!messageIds.every(id => mongoose.Types.ObjectId.isValid(id)) || !mongoose.Types.ObjectId.isValid(seenBy)) {
          console.error("Invalid messageId(s) or seenBy");
          return;
        }

        // Find the latest message from the provided messageIds
        const latestMessage = await Message.findOne({ 
          _id: { $in: messageIds } 
        }).sort({ createdAt: -1 });

        if (latestMessage) {
          // Update all messages from the same sender up to the latest message timestamp
          const updatedMessages = await Message.updateMany(
            { 
              sender: latestMessage.sender, 
              receiver: seenBy, 
              createdAt: { $lte: latestMessage.createdAt },
              status: { $in: ['sent', 'delivered'] }
            },
            { status: 'seen', seenBy }
          );

          // Get all updated message IDs
          const updatedMessageIds = await Message.find(
            { 
              sender: latestMessage.sender, 
              receiver: seenBy, 
              createdAt: { $lte: latestMessage.createdAt },
              status: 'seen',
              seenBy: seenBy
            }
          ).distinct('_id');

          // Notify the sender that the messages were seen
          io.to(latestMessage.sender.toString()).emit("bulkMessageStatusUpdate", { 
            receiverId: seenBy, 
            status: 'seen', 
            seenBy,
            messageIds: updatedMessageIds,
            upToTimestamp: latestMessage.createdAt
          });
          console.log(`${updatedMessages.nModified} messages up to ${latestMessage._id} seen by ${seenBy}`);
        }
      } catch (error) {
        console.error("Error updating message seen status:", error);
      }
    });

    // Handle user typing
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("userTyping", { senderId, receiverId });
    });

    // Handle user stopped typing
    socket.on("stopTyping", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("userStoppedTyping", { senderId, receiverId });
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      const disconnectedUser = Object.keys(connectedUsers).find((userId) =>
        connectedUsers[userId].has(socket.id)
      );

      if (disconnectedUser) {
        connectedUsers[disconnectedUser].delete(socket.id);

        // If no more connections for the user, broadcast offline status
        if (connectedUsers[disconnectedUser].size === 0) {
          delete connectedUsers[disconnectedUser];
          io.emit("onlineUsers", Object.keys(connectedUsers));
          console.log(`User ${disconnectedUser} disconnected`);
        }
      }
    });
  });
};

export default socketHandler;
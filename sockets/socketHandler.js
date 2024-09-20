import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Use a Map to store connected users for better performance
const connectedUsers = new Map();

const socketHandler = (io) => {
  // Function to update user status in the database
  const updateUserStatus = async (userId, status) => {
    try {
      await User.findByIdAndUpdate(userId, { status });
      console.log(`User ${userId} status set to ${status}`);
    } catch (error) {
      console.error(`Error updating user status to ${status}:`, error);
    }
  };

  // Function to emit the list of online users to all connected clients
  const emitOnlineUsers = () => {
    io.emit("onlineUsers", Array.from(connectedUsers.keys()));
  };

  // Handler for when a user joins
  const handleJoin = async (socket, userId) => {
    if (!userId) {
      console.log("Invalid userId for joining room");
      return;
    }

    // Join the user's personal room
    socket.join(userId);

    // Add user to connectedUsers Map
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Update user status to online
    await updateUserStatus(userId, 'online');
    
    // Emit updated list of online users
    emitOnlineUsers();
    
    console.log(`User ${userId} joined room with ID: ${userId}`);

    // Update undelivered messages for the user
    await updateUndeliveredMessages(userId);
  };

  // Function to update undelivered messages when a user comes online
  const updateUndeliveredMessages = async (userId) => {
    // Find all undelivered messages for the user
    const undeliveredMessages = await Message.find(
      { receiver: userId, status: { $in: ['sent', 'delivered'] } }
    );

    if (undeliveredMessages.length > 0) {
      // Mark all undelivered messages as seen
      const updatedMessages = await Message.updateMany(
        { receiver: userId, status: { $in: ['sent', 'delivered'] } },
        { status: 'seen', seenBy: userId }
      );

      const updatedMessageIds = undeliveredMessages.map(msg => msg._id);
      const senders = [...new Set(undeliveredMessages.map(msg => msg.sender.toString()))];

      // Notify senders about the updated message status
      senders.forEach((senderId) => {
        io.to(senderId).emit("bulkMessageStatusUpdate", { 
          receiverId: userId, 
          status: 'seen', 
          seenBy: userId,
          messageIds: updatedMessageIds,
          upToTimestamp: new Date()
        });
      });

      console.log(`${updatedMessages.nModified} messages marked as seen for user ${userId}`);
    }
  };

  // Handler for sending a new message
  const handleSendMessage = async (socket, { senderId, receiverId, content }) => {
    try {
      // Validate sender and receiver IDs
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        console.error("Invalid senderId or receiverId");
        return;
      }

      // Create and save the new message
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        status: connectedUsers.has(receiverId) ? 'delivered' : 'sent',
      });
      await message.save();

      // Emit the new message to both sender and receiver
      io.to(receiverId).emit("newMessage", message);
      io.to(senderId).emit("newMessage", message);
      console.log(`Message sent from ${senderId} to ${receiverId}`);

      // If receiver is online, mark the message as delivered
      if (connectedUsers.has(receiverId)) {
        await Message.findByIdAndUpdate(message._id, { status: 'delivered' });
        io.to(senderId).emit('messageStatusUpdate', { messageId: message._id, status: 'delivered' });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handler for marking messages as seen
  const handleMessageSeen = async (socket, { messageId, seenBy }) => {
    try {
      let messageIds = Array.isArray(messageId) ? messageId : [messageId];
      // Validate message IDs and seenBy ID
      if (!messageIds.every(id => mongoose.Types.ObjectId.isValid(id)) || !mongoose.Types.ObjectId.isValid(seenBy)) {
        console.error("Invalid messageId(s) or seenBy");
        return;
      }

      // Find the latest message from the provided message IDs
      const latestMessage = await Message.findOne({ 
        _id: { $in: messageIds } 
      }).sort({ createdAt: -1 });

      if (latestMessage) {
        // Update all messages from the same sender up to the latest message
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

        // Notify the sender about the seen messages
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
  };

  // Handler for user disconnection
  const handleDisconnect = async (socket) => {
    // Find the disconnected user
    const disconnectedUser = Array.from(connectedUsers.entries())
      .find(([userId, sockets]) => sockets.has(socket.id));

    if (disconnectedUser) {
      const [userId, sockets] = disconnectedUser;
      sockets.delete(socket.id);

      // If no more active connections for this user
      if (sockets.size === 0) {
        connectedUsers.delete(userId);
        emitOnlineUsers();
        console.log(`User ${userId} disconnected`);
        await updateUserStatus(userId, 'offline');
      }
    }
  };

  

  

  // Main connection handler
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Set up event listeners for this socket
    socket.on("join", (data) => handleJoin(socket, data.userId));
    socket.on("sendMessage", (data) => handleSendMessage(socket, data));
    socket.on("messageSeen", (data) => handleMessageSeen(socket, data));
    socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("userTyping", { senderId, receiverId });
    });
    socket.on("stopTyping", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("userStoppedTyping", { senderId, receiverId });
    });

    socket.on("messageEdited", async (updatedMessage) => {
      try {
        // Update the message in the database
        const message = await Message.findByIdAndUpdate(
          updatedMessage._id,
          { 
            content: updatedMessage.content,
            isEdited: true,
            $push: { 
              editHistory: { 
                content: updatedMessage.content, 
                editedAt: new Date() 
              } 
            }
          },
          { new: true }
        );

        if (message) {
          // Broadcast the edited message to both sender and receiver
          io.to(message.receiver.toString()).emit("messageEdited", message);
          io.to(message.sender.toString()).emit("messageEdited", message);
          console.log(`Message ${message._id} edited and broadcasted`);
        } else {
          console.error(`Message ${updatedMessage._id} not found for editing`);
        }
      } catch (error) {
        console.error("Error handling messageEdited event:", error);
      }
    });
    socket.on("disconnect", () => handleDisconnect(socket));
  });


};

export default socketHandler;
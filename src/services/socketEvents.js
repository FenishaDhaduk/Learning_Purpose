import socket from './socket';

export const setupSocketListeners = (
  user,
  selectedUser,
  setMessages,
  setTypingUsers,
  setOnlineUsers
) => {
  socket.connect();
  if (user?.id) {
    socket.emit('join', { userId: user.id });
  }

  socket.on("messageEdited", (updatedMessage) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      )
    );
  });

  socket.on('newMessage', (message) => {
    if (message.sender === selectedUser._id || message.receiver === selectedUser._id) {
      setMessages((prev) => [...prev, message]);
      if (message.receiver === user?.id) {
        socket.emit('messageSeen', { messageId: message._id, seenBy: user?.id });
      }
    }
  });

  socket.on('messageStatusUpdate', ({ messageId, status, seenBy }) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, status, seenBy } : msg))
    );
  });

  socket.on('bulkMessageStatusUpdate', ({ receiverId, status, seenBy, upToTimestamp }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.receiver === receiverId && new Date(msg.createdAt) <= new Date(upToTimestamp)
          ? { ...msg, status, seenBy }
          : msg
      )
    );
  });

  socket.on('userTyping', ({ senderId, receiverId }) => {
    if (receiverId === user?.id) {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    }
  });

  socket.on('userStoppedTyping', ({ senderId, receiverId }) => {
    if (receiverId === user?.id) {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
    }
  });

  socket.on('onlineUsers', (onlineUserIds) => {
    const updatedOnlineUsers = {};
    onlineUserIds.forEach((id) => {
      updatedOnlineUsers[id] = true;
    });
    setOnlineUsers(updatedOnlineUsers);
  });

  return () => {
    socket.off('newMessage');
    socket.off('messageStatusUpdate');
    socket.off('bulkMessageStatusUpdate');
    socket.off('userTyping');
    socket.off('userStoppedTyping');
    socket.off('onlineUsers');
    socket.off("messageEdited");
    socket.disconnect();
  };
};

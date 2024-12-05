import socket from "./socket";

export const setupSocketListeners = (
  user,
  selectedChat,
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
    setMessages((prev) => {
      if (!prev.some(msg => msg._id === message._id)) {
        if (
          (message.sender === user?.id && message.receiver === selectedChat?._id) ||
          (message.receiver === user?.id && message.sender === selectedChat?._id) ||
          message.group === selectedChat?._id
        ) {
          return [...prev, message];
        }
      }
      return prev;
    });

    if (message.receiver === user?.id) {
      socket.emit('messageSeen', { messageId: message._id, seenBy: user?.id });
    }
  });


  socket.on('newGroupMessage', (message) => {
    setMessages((prev) => {
      if (!prev.some(msg => msg._id === message._id)) {
        if (message.group === selectedChat?._id) {
          return [...prev, message];
        }
      }
      return prev;
    });
  });
  

  socket.on('messageStatusUpdate', ({ messageId, status, seenBy }) => {
    setMessages((prev) =>
      prev.map((msg) => (msg._id === messageId ? { ...msg, status, seenBy } : msg))
    );
  });

  socket.on('bulkMessageStatusUpdate', ({ receiverId, status, seenBy, messageIds, upToTimestamp }) => {
    setMessages((prev) =>
      prev.map((msg) =>
        (msg.receiver === receiverId || messageIds.includes(msg._id)) && 
        new Date(msg.createdAt) <= new Date(upToTimestamp)
          ? { ...msg, status, seenBy }
          : msg
      )
    );
  });

  socket.on('userTyping', ({ senderId, receiverId, groupId }) => {
    if (receiverId === user?.id || groupId === selectedChat?._id) {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    }
  });

  socket.on('userStoppedTyping', ({ senderId, receiverId, groupId }) => {
    if (receiverId === user?.id || groupId === selectedChat?._id) {
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

  socket.on('userJoined', (userId) => {
    setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
  });

  socket.on('userLeft', (userId) => {
    setOnlineUsers((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  });

  const emitMessageSeen = (messageId, groupId = null) => {
    socket.emit('messageSeen', { messageId, seenBy: user?.id, groupId });
  };

  const emitTyping = (receiverId, groupId = null) => {
    socket.emit('typing', { senderId: user?.id, receiverId, groupId });
  };

  const emitStopTyping = (receiverId, groupId = null) => {
    socket.emit('stopTyping', { senderId: user?.id, receiverId, groupId });
  };

  const sendMessage = (content, receiverId, groupId = null) => {
    const messageData = {
      senderId: user?.id,
      content,
      ...(groupId ? { groupId } : { receiverId }),
    };
    socket.emit('sendMessage', messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
  };

  const editMessage = (messageId, newContent, groupId = null) => {
    const editData = {
      messageId,
      newContent,
      senderId: user?.id,
      ...(groupId ? { groupId } : {}),
    };
    socket.emit('editMessage', editData);
  };

  return {
    disconnect: () => {
      socket.off('newMessage');
      socket.off('newGroupMessage');
      socket.off('messageStatusUpdate');
      socket.off('bulkMessageStatusUpdate');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
      socket.off('onlineUsers');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('messageEdited');
      socket.disconnect();
    },
    emitMessageSeen,
    emitTyping,
    emitStopTyping,
    sendMessage,
    editMessage,
  };
};
import React, { useRef, useState } from "react";
import socket from "../services/socket";

const ChatInput = ({  user, selectedUser, selectedGroup, setIsTyping, setMessages, isGroupChat }) => {
  const [inputMessage, setInputMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        _id: Date.now().toString(), 
        sender: user?.id,
        content: inputMessage,
        createdAt: new Date(),
        status: 'sent',
        ...(isGroupChat ? { group: selectedGroup._id } : { receiver: selectedUser._id }),
      };

      // Optimistically add the message to the state
      setMessages(prev => [...prev, newMessage]);

      if (isGroupChat) {
        socket.emit("sendMessage", {
          senderId: user?.id,
          groupId: selectedGroup._id,
          content: inputMessage,
        });
      } else {
        socket.emit("sendMessage", {
          senderId: user?.id,
          receiverId: selectedUser._id,
          content: inputMessage,
        });
      }
      setInputMessage("");
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (setIsTyping) {
      setIsTyping((prev) => {
        if (!prev[user?.id]) {
          socket.emit("typing", {
            senderId: user?.id,
            receiverId: isGroupChat ? null : selectedUser?._id,
            groupId: isGroupChat ? selectedGroup?._id : null,
          });
          return { ...prev, [user?.id]: true };
        }
        return prev;
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      if (setIsTyping) {
        setIsTyping((prev) => {
          const updated = { ...prev };
          delete updated[user?.id];
          return updated;
        });
      }
      socket.emit("stopTyping", {
        senderId: user?.id,
        receiverId: isGroupChat ? null : selectedUser?._id,
        groupId: isGroupChat ? selectedGroup?._id : null,
      });
    }, 1000);
  };

  return (
    <div className="input-area">
    <input
      type="text"
      value={inputMessage}
      onChange={handleInputChange}
      placeholder="Type a message"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSendMessage();
        }
      }}
    />
    <button onClick={handleSendMessage}>Send</button>
  </div>
  );
};

export default ChatInput;
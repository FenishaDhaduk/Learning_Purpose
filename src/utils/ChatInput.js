// components/ChatInput.js
import React, { useState, useRef } from "react";
import socket from "../services/socket";

const ChatInput = ({ user, selectedUser, setIsTyping }) => {
  const [inputMessage, setInputMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit("sendMessage", {
        senderId: user?.id,
        receiverId: selectedUser._id,
        content: inputMessage,
      });
      setInputMessage("");
      // Stop typing indication after message is sent
      socket.emit("stopTyping", {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (setIsTyping) {
      setIsTyping((prev) => {
        if (!prev[user?.id]) {
          socket.emit("typing", {
            senderId: user?.id,
            receiverId: selectedUser._id,
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
        receiverId: selectedUser._id,
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

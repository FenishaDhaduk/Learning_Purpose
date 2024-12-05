import React, { useState, useRef } from "react";
import socket from "../services/socket";

const ChatInput = ({ user, selectedUser, setIsTyping ,selectedGroup,setMessages}) => {
  const [inputMessage, setInputMessage] = useState("");
  const typingTimeoutRef = useRef(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const messageData = {
        senderId: user?.id,
        content: inputMessage,
      };
  
      if (selectedGroup) {
        messageData.receiverId = selectedGroup._id;
        messageData.groupId = selectedGroup._id;  
      } else if (selectedUser) {
        messageData.receiverId = selectedUser._id;
      }
  
      // Optimistic UI update: Add message immediately to local state
      setMessages((prevMessages) => [...prevMessages, messageData]);
  
      // Emit the message to the server
      socket.emit("sendMessage", messageData);
  
      // Clear the input field
      setInputMessage("");
    }
  };
  
  
  

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  
    if (setIsTyping) {
      setIsTyping((prev) => {
        if (!prev[user?.id]) {
          if (selectedGroup) {
            // Group chat: Use groupId as receiverId
            socket.emit("typing", {
              senderId: user?.id,
              receiverId: selectedGroup._id,  // Use group ID
              groupId: selectedGroup._id,     // You can also send the groupId if needed
            });
          } else {
            // Direct message: Use selectedUser's ID as receiverId
            socket.emit("typing", {
              senderId: user?.id,
              receiverId: selectedUser._id,  // Use the receiver's ID for DM
            });
          }
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
      if (selectedGroup) {
        socket.emit("stopTyping", {
          senderId: user?.id,
          receiverId: selectedGroup._id,  
          groupId: selectedGroup._id,     
        });
      } else {
        socket.emit("stopTyping", {
          senderId: user?.id,
          receiverId: selectedUser._id,  
        });
      }
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

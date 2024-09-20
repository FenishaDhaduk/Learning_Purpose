// components/ChatInput.js
import React, { useState, useRef } from 'react';
import socket from '../services/socket';

const ChatInput = ({ user, selectedUser, setIsTyping, setMessages }) => {
  const [inputMessage, setInputMessage] = useState('');
  const typingTimeoutRef = useRef(null);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit('sendMessage', {
        senderId: user?.id,
        receiverId: selectedUser._id,
        content: inputMessage,
      });
      setInputMessage('');
      setIsTyping(false);
      socket.emit('stopTyping', {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!setIsTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stopTyping', {
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
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatInput;

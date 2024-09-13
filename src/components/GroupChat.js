// src/components/GroupChat.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Custom hook to access current user
import socket from '../services/socket'; // Ensure socket is correctly initialized

const GroupChat = () => {
  const { user: currentUser } = useAuth(); 
  const [groupId, setGroupId] = useState(''); // State to hold selected group ID
  const [content, setContent] = useState(''); // State to hold message content

  const sendMessageToGroup = (groupId, content) => {
    if (!groupId) {
      console.error('Group ID is not selected');
      return;
    }
    if (!content) {
      console.error('Message content is empty');
      return;
    }

    socket.emit('sendMessage', { senderId: currentUser._id, group: groupId, content });
    setContent(''); //
  };

  return (
    <div className="group-chat-container">
      <h2>Group Chat</h2>

      <input
        type="text"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        placeholder="Enter Group ID"
      />

      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your message"
      />

      <button onClick={() => sendMessageToGroup(groupId, content)}>Send Message</button>
    </div>
  );
};

export default GroupChat;

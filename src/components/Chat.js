// src/components/Chat.js
import React, { useState } from 'react';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import '../../src/Chat.css'; // CSS for overall chat styling

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="chat-container">
      <div className="user-list-container">
        <UserList onSelectUser={setSelectedUser} />
      </div>
      <div className="chat-window-container">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div className="select-user-message">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;

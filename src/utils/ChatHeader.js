import React from 'react';

const ChatHeader = ({ selectedUser, onlineUsers }) => {
  return (
    <div className="main-header">
      <div className="chat-header">
        <h3>{selectedUser.username}</h3>
        <span className="user-status">
          {onlineUsers[selectedUser._id] ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;

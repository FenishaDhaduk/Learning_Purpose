import React, { useState } from 'react';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import '../../src/Chat.css'; // CSS for overall chat styling

const Chat = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <div className="chat-container">
      <div className="user-list-container">
        <UserList
          onSelectUser={(user) => {
            setSelectedUser(user);
            setSelectedGroup(null); // Clear group selection when user is selected
          }}
          onSelectGroup={(group) => {
            setSelectedGroup(group);
            setSelectedUser(null); // Clear user selection when group is selected
          }}
        />
      </div>
      <div className="chat-window-container">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : selectedGroup ? (
          <ChatWindow selectedGroup={selectedGroup} />
        ) : (
          <div className="select-user-message">Select a user or group to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Chat;

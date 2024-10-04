import React from 'react';

const ChatHeader = ({ selectedUser, selectedGroup, onlineUsers, isGroupChat }) => {
  if (isGroupChat) {
    return (
      <div className="chat-header">
        <div className="group-header">
          <h3>{selectedGroup.name}</h3>
          <div className="group-members">
            {selectedGroup.members.map((member) => (
              <div className="group-member" key={member._id}>
                <div className="avatar">
                  {member.profileImage ? (
                    <img
                      src={`${process.env.REACT_APP_API_ENDPOINT}/uploads/profileImages/${member.profileImage}`}
                      alt={member.username}
                    />
                  ) : (
                    <span>{member.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span>{member.username}</span>
                <span>{onlineUsers[member._id] ? '(Online)' : '(Offline)'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="chat-header">
        <div className="user-header">
          <h3>{selectedUser?.username}</h3>
          <span>{onlineUsers[selectedUser?._id] ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    );
  }
};

export default ChatHeader;
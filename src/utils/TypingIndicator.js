import React from 'react';

const TypingIndicator = ({ typingUsers, selectedUser }) => {
  const typingUsernames = Object.keys(typingUsers)
    .filter((id) => typingUsers[id] && id === selectedUser._id)
    .map(() => selectedUser.username);

  if (typingUsernames.length > 0) {
    return <div className="typing-indicator">{typingUsernames.join(', ')} is typing...</div>;
  }

  return null;
};

export default TypingIndicator;

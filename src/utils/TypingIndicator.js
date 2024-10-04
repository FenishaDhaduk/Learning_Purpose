import React from 'react';

const TypingIndicator = ({ typingUsers, selectedUser, selectedGroup, isGroupChat }) => {
  if (!selectedUser && !selectedGroup) {
    return null;
  }

  let typingUsernames = [];

  if (isGroupChat) {
    typingUsernames = Object.keys(typingUsers)
      .filter((id) => typingUsers[id] && selectedGroup.members.some(member => member._id === id))
      .map((id) => selectedGroup.members.find(member => member._id === id).username);
  } else {
    typingUsernames = Object.keys(typingUsers)
      .filter((id) => typingUsers[id] && id === selectedUser._id)
      .map(() => selectedUser.username);
  }

  if (typingUsernames.length > 0) {
    const typingText = typingUsernames.length === 1 
      ? `${typingUsernames[0]} is typing...`
      : `${typingUsernames.join(', ')} are typing...`;
    return <div className="typing-indicator">{typingText}</div>;
  }

  return null;
};

export default TypingIndicator;
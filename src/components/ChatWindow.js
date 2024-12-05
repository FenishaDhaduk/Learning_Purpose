import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import '../../src/ChatWindow.css';
import { setupSocketListeners } from '../services/socketEvents';
import { fetchMessages } from '../services/messageService';
import ChatInput from '../utils/ChatInput';
import ChatMessages from '../utils/ChatMessages';
import ChatHeader from '../utils/ChatHeader';
import TypingIndicator from '../utils/TypingIndicator';

const ChatWindow = ({ selectedUser, selectedGroup }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const [stickyHeader, setStickyHeader] = useState('');

  const isGroupChat = !!selectedGroup;

  useEffect(() => {
    const {
      disconnect,
      emitMessageSeen,
      emitTyping,
      emitStopTyping,
      sendMessage,
      editMessage
    } = setupSocketListeners(
      user,
      selectedUser || selectedGroup,
      setMessages,
      setTypingUsers,
      setOnlineUsers
    );

    return () => {
      disconnect();
    };
  }, [user, selectedUser, selectedGroup]);

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (selectedUser || selectedGroup) {
        try {
          let parsedData;
          if (isGroupChat) {
            const data = await fetchMessages(null, null, selectedGroup._id);
            parsedData = data?.messages?.map(message => ({
              ...message,
              createdAt: new Date(message.createdAt),
              updatedAt: new Date(message.updatedAt)
            }));
          } else {
            const data = await fetchMessages(user?.id, selectedUser._id);
            parsedData = data?.map(message => ({
              ...message,
              createdAt: new Date(message.createdAt),
              updatedAt: new Date(message.updatedAt)
            }));
          }
          setMessages(parsedData);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      }
    };

    fetchInitialMessages();
  }, [selectedUser, selectedGroup, user, isGroupChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  

  const handleScroll = () => {
    const scrollPosition = messagesEndRef.current.parentNode.scrollTop;
    const dateHeaders = Array.from(document.querySelectorAll('.date-header'));
    const visibleHeaders = dateHeaders.filter(
      (header) => header.offsetTop <= scrollPosition + 20
    );

    if (visibleHeaders.length > 0) {
      const lastVisibleHeader = visibleHeaders[visibleHeaders.length - 1];
      setStickyHeader(lastVisibleHeader.textContent);
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader 
        selectedUser={selectedUser} 
        selectedGroup={selectedGroup} 
        onlineUsers={onlineUsers} 
        isGroupChat={isGroupChat}
      />
      <div className={`${stickyHeader !== '' ? 'sticky-date-header' : ''}`}>{stickyHeader}</div>
      <div className="messages-area" onScroll={handleScroll}>
        <ChatMessages 
          messages={messages} 
          user={user} 
          setStickyHeader={setStickyHeader} 
          isGroupChat={isGroupChat}
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          setMessages={setMessages}
        />
        <div ref={messagesEndRef} />
      </div>
      <div className='typing'>
        <TypingIndicator 
          typingUsers={typingUsers} 
          selectedUser={selectedUser} 
          selectedGroup={selectedGroup}
          isGroupChat={isGroupChat}
        />
      </div>
      <ChatInput
        user={user}
        selectedUser={selectedUser}
        setIsTyping={setTypingUsers}
        setMessages={setMessages}
        selectedGroup={selectedGroup}
        isGroupChat={isGroupChat}
      />
    </div>
  );
};

export default ChatWindow;
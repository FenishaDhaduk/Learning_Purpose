// ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../../src/ChatWindow.css';
import { setupSocketListeners } from '../services/socketEvents';
import { fetchMessages } from '../services/messageService';
import ChatInput from '../utils/ChatInput';
import ChatMessages from '../utils/ChatMessages';
import ChatHeader from '../utils/ChatHeader';
import TypingIndicator from '../utils/TypingIndicator';

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const messagesEndRef = useRef(null);
  const [stickyHeader, setStickyHeader] = useState('');


  useEffect(() => {
    const cleanupSocket = setupSocketListeners(
      user,
      selectedUser,
      setMessages,
      setTypingUsers,
      setOnlineUsers
    );

    return cleanupSocket;
  }, [selectedUser, user]);

  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (selectedUser) {
        try {
          const data = await fetchMessages(user?.id, selectedUser._id);
          const parsedData = data.map(message => ({
            ...message,
            createdAt: new Date(message.createdAt),
            updatedAt: new Date(message.updatedAt)
          }));
          setMessages(parsedData);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      }
    };

    fetchInitialMessages();
  }, [selectedUser, user]);

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
      <ChatHeader selectedUser={selectedUser} onlineUsers={onlineUsers} />
      <div className={`${stickyHeader !== '' && 'sticky-date-header'}`}>{stickyHeader}</div>
      <div className="messages-area" onScroll={handleScroll}>
        <ChatMessages messages={messages} user={user} setStickyHeader={setStickyHeader} selectedUser={selectedUser} />
        <div ref={messagesEndRef} />
      </div>
      <div className='typing'>
      
      <TypingIndicator typingUsers={typingUsers} selectedUser={selectedUser} />
      </div>
      <ChatInput
        user={user}
        selectedUser={selectedUser}
        setIsTyping={setTypingUsers}
        setMessages={setMessages}
      />
    </div>
  );
};

export default ChatWindow;

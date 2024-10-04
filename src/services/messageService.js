import { fetchWithAuth } from './api';
import socket from '../services/socket';


export const fetchMessages = async (userId, receiverId, groupId) => {
  const queryParams = groupId
    ? `groupId=${groupId}`
    : `userId=${userId}&receiverId=${receiverId}`;

  const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/messages?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return await response.json();
};


export const sendMessage = (message) => {
  socket.emit('sendMessage', message);
};

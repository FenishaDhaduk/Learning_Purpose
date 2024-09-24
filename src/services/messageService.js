import { fetchWithAuth } from './api';
import socket from '../services/socket';


export const fetchMessages = async (userId, receiverId) => {
  const data = await fetchWithAuth(
    `${process.env.REACT_APP_API_ENDPOINT}/messages?userId=${userId}&receiverId=${receiverId}`
  );
  return data;
};

export const sendMessage = (message) => {
  socket.emit('sendMessage', message);
};

// src/components/UserList.js
import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import '../../src/UserList.css'; // CSS for styling

const UserList = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({}); 

  useEffect(() => {
    if (user) {
      fetchUsers();

      // Listen for online users event
      socket.on('onlineUsers', (onlineUserIds) => {
        const updatedOnlineUsers = {};
        onlineUserIds.forEach((id) => {
          updatedOnlineUsers[id] = true;
        });
        setOnlineUsers(updatedOnlineUsers);
      });

      // Cleanup socket listeners on component unmount
      return () => {
        socket.off('onlineUsers');
      };
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_ENDPOINT + '/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Include token if required
        },
      });
      const data = await response.json();
      setUsers(data.filter(u => u._id !== user?.id)); 
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  if (!user) {
    // Optionally render a loading state or redirect to login if user is not authenticated
    return <div>Loading...</div>;
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
          <img src={"https://miro.medium.com/v2/resize:fill:64:64/0*z_Nooj-pocsAxwZW"} alt={user.username} />
          <div className="user-info">
            <h4>{user.username}</h4>
            <span className="user-status">
              {onlineUsers[user._id] ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

// src/components/UserList.js
import React, { useState ,useEffect} from 'react';
import ProfileImageUploader from './ProfileImageUploader';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import '../../src/UserList.css'; // CSS for styling

const UserList = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(user);

  const handleProfileImageUpdate = (updatedUser) => {
    console.log("updatedUser",updatedUser)
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u._id === updatedUser._id ? updatedUser : u));
    setUsers(updatedUsers);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();

      socket.on('onlineUsers', (onlineUserIds) => {
        const updatedOnlineUsers = {};
        onlineUserIds.forEach((id) => {
          updatedOnlineUsers[id] = true;
        });
        setOnlineUsers(updatedOnlineUsers);
      });

      return () => {
        socket.off('onlineUsers');
      };
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_ENDPOINT + '/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setUsers(data.filter((u) => u._id !== user?.id));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };
  return (
    <div className="user-list">
      <ProfileImageUploader user={currentUser} onUpdate={handleProfileImageUpdate} />
      {users.map((user) => (
        <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
          <img
            src={user.profileImage ? `${process.env.REACT_APP_API_ENDPOINT}/uploads/profileImages/${user.profileImage}` : "https://miro.medium.com/v2/resize:fill:64:64/0*z_Nooj-pocsAxwZW"}
            alt={user.username}
          />
          <div className="user-info">
            <h4>{user.username}</h4>
            <span className="user-status">{onlineUsers[user._id] ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

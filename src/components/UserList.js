import React, { useState, useEffect } from "react";
import ProfileImageUploader from "./ProfileImageUploader";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import "../../src/UserList.css"; // CSS for styling

const UserList = ({ onSelectUser, onSelectGroup }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(user);

  const handleProfileImageUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) =>
      u._id === updatedUser._id ? updatedUser : u
    );
    setUsers(updatedUsers);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();

      socket.on("onlineUsers", (onlineUserIds) => {
        const updatedOnlineUsers = {};
        onlineUserIds.forEach((id) => {
          updatedOnlineUsers[id] = true;
        });
        setOnlineUsers(updatedOnlineUsers);
      });

      return () => {
        socket.off("onlineUsers");
      };
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        process.env.REACT_APP_API_ENDPOINT + "/users",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();

      // Filter out current logged-in user's groups
      const loggedInUser = data?.filter((u) => u._id == user?.id);
      const userList = data?.filter((u) => u._id !== user?.id);
      const groupList = loggedInUser?.map((group) => {
        return group?.groups || [];
      });
      setUserGroups(groupList);
      setUsers(userList);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  return (
    <div className="chat-sidebar">
      <ProfileImageUploader
        user={currentUser}
        onUpdate={handleProfileImageUpdate}
      />

      <h3>Users</h3>
      {users.map((user) => (
        <div
          key={user._id}
          className="user-item"
          onClick={() => onSelectUser(user)}
        >
          <img
            className="profile-img"
            src={
              user.profileImage
                ? `${process.env.REACT_APP_API_ENDPOINT}/uploads/profileImages/${user.profileImage}`
                : "https://miro.medium.com/v2/resize:fill:64:64/0*z_Nooj-pocsAxwZW"
            }
            alt={user.username}
          />
          <div className="user-info">
            <h4>{user.username}</h4>
            <span
              className={`user-status ${
                onlineUsers[user._id] ? "online" : "offline"
              }`}
            >
              {onlineUsers[user._id] ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      ))}
      {userGroups[0]?.length != 0  && (<h3>Groups</h3>)}
      {userGroups[0]?.map((group) => (
        <div
          key={group._id}
          className="user-item"
          onClick={() => onSelectGroup(group)}
        >
          <div className="avatar">{group?.name?.charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <h4>{group?.name}</h4>
            <p className="group-members">
              {group?.members
                ?.map((member) => member?.username?.charAt(0))
                .join(", ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList;

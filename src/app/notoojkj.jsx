"use client";

import React, { useState, useEffect } from "react";

export default function Home() {

  
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState("");

  useEffect(() => {
    // Fetch notifications on component mount
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(process.env.API_ENDPOINT + "notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      console.log(data,"4444")
      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(process.env.API_ENDPOINT + "notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newNotification }),
      });
      if (!response.ok) {
        throw new Error("Failed to create notification");
      }
      await response.json();
      fetchNotifications(); // Refresh notifications after creating a new one
      setNewNotification("");
    } catch (error) {
      console.error(error);
    }
  };

  console.log(notifications,"44444")

  return (
    <div className="container">
      <label
        class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
        for="file_input"
      >
       
      Notifications
      </label>
      <input
        class="block ml-5  text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
        id="text_input"
        type="text"
        // value={newNotification}
        onChange={(e) => setNewNotification(e.target.value)}
      ></input>

      <button
        onClick={(event) => handleNotificationSubmit(event)}
        class="bg-transparent mt-3 ml-5 hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      >
        Create Notifiction
      </button>

      {notifications.map((notification) => (
        <div key={notification._id}>
          <p>{notification.message}</p>
          <p>{notification.timestamp}</p>
        </div>
      ))}
   
    </div>
  );
}

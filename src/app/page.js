// Client-side code (React component)
"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://172.16.17.121:3001");

export default function Home() {
  const [notification, setNotification] = useState("");

  useEffect(() => {
    socket.on("newNotification", (data) => {
      console.log("New notification:", data);
      setNotification(data);
      // Handle the received notification as needed
    });

    // Cleanup on unmount
    return () => {
      socket.off("newNotification");
    };
  }, []);

  const sendNotification = async (event) => {
    event.preventDefault();
    socket.emit("sendNotification", notification);
    try {
      const response = await fetch("http://localhost:3001/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: notification }),
      });

      const data = await response.json();
      console.log(data, "545554");
     
      setNotification("");
    } catch (error) {
      console.error(error);
    }
  };

  console.log(notification, "notification5555");

  return (
    <div>
      <h1>Notifications</h1>
      <div className="mb-6">
        <label
          htmlFor="notification-input"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Notification
        </label>
        <input
          onChange={(event) => setNotification(event.target.value)}
          value={notification}
          type="text"
          id="notification-input"
          className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
        <button
          onClick={(event) => sendNotification(event)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
        >
          Send Notification
        </button>
      </div>
    </div>
  );
}

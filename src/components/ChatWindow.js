import React, { useState, useEffect, useRef } from "react";
import socket from "../services/socket";
import { useAuth } from "../context/AuthContext";
import "../../src/ChatWindow.css";
import { fetchWithAuth } from "../services/api";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

const ChatWindow = ({ selectedUser }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [stickyHeader, setStickyHeader] = useState("");

  useEffect(() => {
    socket.connect();
    if (user?.id) {
      socket.emit("join", { userId: user.id });
    }

    socket.on("newMessage", (message) => {
      if (
        message.sender === selectedUser._id ||
        message.receiver === selectedUser._id
      ) {
        setMessages((prev) => [...prev, message]);
        if (message.receiver === user?.id) {
          socket.emit("messageSeen", {
            messageId: message._id,
            seenBy: user?.id,
          });
        }
      }
    });

    socket.on("messageStatusUpdate", ({ messageId, status, seenBy }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status, seenBy } : msg
        )
      );
    });

    socket.on(
      "bulkMessageStatusUpdate",
      ({ receiverId, status, seenBy, upToTimestamp }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.receiver === receiverId &&
            new Date(msg.createdAt) <= new Date(upToTimestamp)
              ? { ...msg, status, seenBy }
              : msg
          )
        );
      }
    );

    socket.on("userTyping", ({ senderId, receiverId }) => {
      if (receiverId === user?.id) {
        setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      }
    });

    socket.on("userStoppedTyping", ({ senderId, receiverId }) => {
      if (receiverId === user?.id) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[senderId];
          return updated;
        });
      }
    });

    socket.on("onlineUsers", (onlineUserIds) => {
      const updatedOnlineUsers = {};
      onlineUserIds.forEach((id) => {
        updatedOnlineUsers[id] = true;
      });
      setOnlineUsers(updatedOnlineUsers);
    });

    return () => {
      socket.off("newMessage");
      socket.off("messageStatusUpdate");
      socket.off("bulkMessageStatusUpdate");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("onlineUsers");
      socket.disconnect();
    };
  }, [selectedUser, user]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await fetchWithAuth(
          `${process.env.REACT_APP_API_ENDPOINT}/messages?userId=${user?.id}&receiverId=${selectedUser._id}`
        );
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      socket.emit("sendMessage", {
        senderId: user?.id,
        receiverId: selectedUser._id,
        content: inputMessage,
      });
      setInputMessage("");
      setIsTyping(false);
      socket.emit("stopTyping", {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stopTyping", {
        senderId: user?.id,
        receiverId: selectedUser._id,
      });
    }, 1000);
  };

  const renderTypingIndicator = () => {
    const typingUsernames = Object.keys(typingUsers)
      .filter((id) => typingUsers[id])
      .map((id) => (selectedUser._id === id ? selectedUser.username : ""));

    if (typingUsernames.length > 0) {
      return (
        <div className="typing-indicator">
          {typingUsernames.join(", ")} is typing...
        </div>
      );
    }

    return null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return "✓"; // Single tick
      case "delivered":
        return "✓✓"; // Double tick
      case "seen":
        return <span style={{ color: "blue" }}>✓✓</span>; // Double tick blue
      default:
        return "";
    }
  };

  const renderMessagesWithHeaders = () => {
    const groupedMessages = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      const previousMessage = messages[index - 1];
      const previousDate = previousMessage
        ? new Date(previousMessage.createdAt)
        : null;

      const shouldShowDateHeader =
        !previousMessage || !isSameDay(messageDate, previousDate);

      if (shouldShowDateHeader) {
        groupedMessages.push({
          type: "dateHeader",
          date: messageDate,
        });
      }

      groupedMessages.push({
        type: "message",
        message,
      });
    });

    return groupedMessages.map((item, index) => {
      if (item.type === "dateHeader") {
        const headerText = isToday(item.date)
          ? "Today"
          : isYesterday(item.date)
          ? "Yesterday"
          : isThisWeek(item.date)
          ? format(item.date, "EEEE")
          : format(item.date, "dd/MM/yyyy");

        return (
          <div key={index} className="date-header" ref={item.ref}>
            {headerText}
          </div>
        );
      } else {
        const msg = item.message;
        return (
          <div
            key={index}
            className={`message ${
              msg.sender === user?.id ? "message-sent" : "message-received"
            }`}
          >
            <div className="message-content">{msg.content}</div>
            <span className="message-timestamp">
              {format(new Date(msg.createdAt), "hh:mm a")}
              {msg.sender === user?.id && getStatusIcon(msg.status)}
            </span>
          </div>
        );
      }
    });
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  console.log(messages, stickyHeader, "messages");

  const handleScroll = () => {
    // .parentNode.scrollTop gives the vertical scroll position of its container.
    const scrollPosition = messagesEndRef.current.parentNode.scrollTop;
    const dateHeaders = Array.from(document.querySelectorAll(".date-header"));
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
      <div className="main-header">
        <div className="chat-header">
          <h3>{selectedUser.username}</h3>
          <span className="user-status">
            {onlineUsers[selectedUser._id] ? "Online" : "Offline"}
          </span>
        </div>
        <div>{renderTypingIndicator()}</div>
      </div>
      <div className={`${stickyHeader != "" && (`sticky-date-header`)} `}>
        {stickyHeader}
      </div>
      <div className="messages-area" onScroll={handleScroll}>
        {renderMessagesWithHeaders()}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-area">
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;

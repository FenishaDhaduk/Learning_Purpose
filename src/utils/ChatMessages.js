import React, { useState, useEffect } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import socket from "../services/socket";
import { getStatusIcon } from "../utils/messageUtils";

const ChatMessages = ({ messages, user, selectedUser }) => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editableMessages, setEditableMessages] = useState({});
  const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

  useEffect(() => {
    // Check and update editable status for each message initially
    const initialEditableMessages = {};
    messages.forEach((msg) => {
      initialEditableMessages[msg._id] = isMessageEditable(msg.createdAt);
    });
    setEditableMessages(initialEditableMessages);

    // Set an interval to check every 30 seconds for messages that may become uneditable
    const intervalId = setInterval(() => {
      const updatedEditableMessages = {};
      messages.forEach((msg) => {
        updatedEditableMessages[msg._id] = isMessageEditable(msg.createdAt);
      });
      setEditableMessages(updatedEditableMessages);
    }, 30000); // Check every 30 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [messages]);

  // Function to check if the message is still editable
  const isMessageEditable = (createdAt) => {
    const now = new Date();
    const messageTime = new Date(createdAt);
    const timeDiff = now - messageTime;
    return timeDiff <= editTimeLimit;
  };

  const handleEditMessage = (messageId) => {
    const messageToEdit = messages.find((msg) => msg._id === messageId);

    // Check if the message is still editable
    if (isMessageEditable(messageToEdit.createdAt)) {
      setEditingMessageId(messageId);
      setEditContent(messageToEdit.content);
    } else {
      alert("You can only edit messages within 15 minutes of sending.");
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== "") {
      const updatedMessage = {
        _id: editingMessageId,
        content: editContent,
        sender: user.id,
        receiver: selectedUser._id,
      };
      socket.emit("messageEdited", updatedMessage);
      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const renderMessagesWithHeaders = () => {
    const groupedMessages = [];
    let currentDate = null;

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      let formattedDate = format(messageDate, "MMMM d, yyyy"); // Default format

      if (isToday(messageDate)) {
        formattedDate = "Today";
      } else if (isYesterday(messageDate)) {
        formattedDate = "Yesterday";
      } else if (isThisWeek(messageDate)) {
        formattedDate = format(messageDate, "EEEE"); // Display weekday name (e.g., "Monday")
      }

      if (formattedDate !== currentDate) {
        groupedMessages.push({
          type: "dateHeader",
          date: formattedDate,
        });
        currentDate = formattedDate;
      }

      groupedMessages.push({
        type: "message",
        message,
      });
    });

    return groupedMessages.map((item, index) => {
      if (item.type === "dateHeader") {
        return (
          <div key={`date-${index}`} className="date-header">
            {item.date}
          </div>
        );
      } else {
        const msg = item.message;
        const canEdit = editableMessages[msg._id]; 

        return (
          <div
            key={`msg-${msg._id}`}
            className={`message ${
              msg.sender === user?.id ? "message-sent" : "message-received"
            }`}
          >
            {editingMessageId === msg._id ? (
              <div className="edit-message">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={() => setEditingMessageId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <div className="message-content">
                  <p>{msg.content}</p>
                  <span className="message-timestamp">
                    {format(new Date(msg.createdAt), "hh:mm a")}
                    {msg.sender === user?.id && getStatusIcon(msg.status)}
                    {msg.isEdited && " (edited)"}
                  </span>
                  {msg.sender === user?.id && canEdit && (
                    <button onClick={() => handleEditMessage(msg._id)}>
                      Edit
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }
    });
  };

  return <div className="messages-area">{renderMessagesWithHeaders()}</div>;
};

export default ChatMessages;

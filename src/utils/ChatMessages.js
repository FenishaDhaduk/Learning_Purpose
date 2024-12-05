import React, { useState, useEffect } from "react";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import socket from "../services/socket";
import { getStatusIcon } from "../utils/messageUtils";

const ChatMessages = ({ messages, user, isGroupChat, selectedUser, selectedGroup,setMessages }) => {
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editableMessages, setEditableMessages] = useState({});
  const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds

  useEffect(() => {
    const initialEditableMessages = {};
    messages.forEach((msg) => {
      initialEditableMessages[msg._id] = isMessageEditable(msg.createdAt);
    });
    setEditableMessages(initialEditableMessages);

    const intervalId = setInterval(() => {
      const updatedEditableMessages = {};
      messages.forEach((msg) => {
        updatedEditableMessages[msg._id] = isMessageEditable(msg.createdAt);
      });
      setEditableMessages(updatedEditableMessages);
    }, 30000);

    return () => clearInterval(intervalId);


  }, [messages]);
  useEffect(() => {
    console.log("callmessage...")
    socket.on('newGroupMessage', (message) => {
      setMessages((prev) => {
        if (!prev.some(msg => msg._id === message._id)) {
          if (message.groupId === selectedGroup?._id) {
            return [...prev, message];
          }
        }
        return prev;
      });
    });

    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (!prev.some(msg => msg._id === message._id)) {
          if (
            (message.senderId === user?.id && message.receiverId === selectedUser?._id) ||
            (message.receiverId === user?.id && message.senderId === selectedUser?._id) ||
            message.groupId === selectedGroup?._id
          ) {
            return [...prev, message];
          }
        }
        return prev;
      });
    });

    return () => {
      socket.off('newGroupMessage');
      socket.off('newMessage');
    };
  }, [selectedGroup, selectedUser, user, setMessages]);
  
  
  const isMessageEditable = (createdAt) => {
    const now = new Date();
    const messageTime = new Date(createdAt);
    const timeDiff = now - messageTime;
    return timeDiff <= editTimeLimit;
  };

  const handleEditMessage = (messageId) => {
    const messageToEdit = messages.find((msg) => msg._id === messageId);
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
        receiver: isGroupChat ? null : messages.find(m => m._id === editingMessageId).receiver,
        group: isGroupChat ? messages.find(m => m._id === editingMessageId).group : null
      };
      socket.emit("messageEdited", updatedMessage);
    

      setEditingMessageId(null);
      setEditContent("");
    }
  };

  const renderMessagesWithHeaders = () => {
    const groupedMessages = [];
    let currentDate = null;

    const filteredMessages = messages.filter(msg =>
      isGroupChat
        ? msg.group === selectedGroup?._id
        : (msg.sender === user?.id && msg.receiver === selectedUser?._id) ||
          (msg.receiver === user?.id && msg.sender === selectedUser?._id)
    );

    filteredMessages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt);
      let formattedDate = format(messageDate, "MMMM d, yyyy");

      if (isToday(messageDate)) {
        formattedDate = "Today";
      } else if (isYesterday(messageDate)) {
        formattedDate = "Yesterday";
      } else if (isThisWeek(messageDate)) {
        formattedDate = format(messageDate, "EEEE");
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
        const isUserMessage = msg.sender._id === user?.id;

        return (
          <div
            key={`msg-${msg._id}`}
            className={`message ${isUserMessage ? "message-sent" : "message-received"}`}
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
                  {isGroupChat && !isUserMessage && (
                    <span className="sender-name">{msg.sender.username}</span>
                  )}
                  <p>{msg.content}</p>
                  <span className="message-timestamp">
                    {format(new Date(msg.createdAt), "hh:mm a")}
                    {isUserMessage && getStatusIcon(msg.status)}
                    {msg.isEdited && " (edited)"}
                  </span>
                  {isUserMessage && canEdit && (
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

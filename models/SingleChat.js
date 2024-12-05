// models/SingleChat.js
import mongoose from 'mongoose';

const singleChatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: false, 
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true }
);

// Adding an index to ensure that a unique chat exists between two users
singleChatSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export default mongoose.model('SingleChat', singleChatSchema);

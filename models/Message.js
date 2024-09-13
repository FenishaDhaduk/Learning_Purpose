// backend/models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' }, // Track message status
  seenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Track user who has seen the message
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For group chat
  content: { type: String, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
  seenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isEdited: { type: Boolean, default: false },
  editHistory: [{ 
    content: String, 
    editedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);


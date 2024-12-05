import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For individual chats
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, // For group chats
    content: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    isEdited: { type: Boolean, default: false },
    editHistory: [
      {
        content: String,
        editedAt: Date,
      },
    ],
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);

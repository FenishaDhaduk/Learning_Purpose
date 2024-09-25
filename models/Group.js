import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Changed from single admin to admins array
}, { timestamps: true });

export default mongoose.model('Group', groupSchema);

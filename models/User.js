import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  status: { type: String, enum: ['online', 'offline'], default: 'offline' },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }], 

}, { timestamps: true });

export default mongoose.model('User', userSchema);


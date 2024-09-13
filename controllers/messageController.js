import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content, group } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sender)) {
      return res.status(400).json({ error: 'Invalid sender ID' });
    }
    if (receiver && !mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ error: 'Invalid receiver ID' });
    }
    if (group && !mongoose.Types.ObjectId.isValid(group)) {
      return res.status(400).json({ error: 'Invalid group ID' });
    }

    const message = new Message({ sender, receiver, content, group });
    await message.save();

    res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
export const getMessages = async (req, res) => {
  try {
    const { userId, receiverId } = req.query;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

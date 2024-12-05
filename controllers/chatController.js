import SingleChat from '../models/SingleChat.js';
import Group from '../models/Group.js';

export const fetchUserChats = async (req, res) => {
    try {
      const userId = req.user.id;
      const singleChats = await SingleChat.find({
        $or: [{ sender: userId }, { receiver: userId }],
      }).populate('sender receiver', 'username profileImage');
  
      const groupChats = await Group.find({
        members: userId,
      }).populate('members admins', 'username profileImage');
  
      const allChats = [
        ...singleChats.map(chat => ({
          type: 'single',
          ...chat.toObject(),
        })),
        ...groupChats.map(group => ({
          type: 'group',
          ...group.toObject(),
        })),
      ];
      res.status(200).json(allChats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chats' });
    }
  };


export const fetchGroupMessages = async (req, res) => {
    try {
      const userId = req.user.id;
      const { groupId } = req.params;
  
      // Check if the groupId is valid
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({ error: 'Invalid group ID' });
      }
  
      // Find the group and check if the user is a member
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ error: 'Group not found' });
      }
  
      // Check if the user is a member of the group
      if (!group.members.includes(userId)) {
        return res.status(403).json({ error: 'You are not a member of this group' });
      }
  
      // Fetch messages from the specified group
      const groupMessages = await Message.find({ group: groupId }).sort({ createdAt: 1 });
  
      res.status(200).json(groupMessages);
    } catch (error) {
      console.error('Error fetching group messages:', error);
      res.status(500).json({ error: 'Failed to fetch group messages' });
    }
  };

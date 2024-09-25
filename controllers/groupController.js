import Group from '../models/Group.js';


export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;

    const group = new Group({
      name,
      members: [...members, req.user.id], // Include creator in members list
      admins: [req.user.id], // The creator becomes the first admin
    });

    await group.save();
    res.status(201).json({ message: 'Group created successfully', data: group });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


export const manageMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { action, memberId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if the user performing the action is an admin
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can manage group members' });
    }

    if (action === 'add') {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      } else {
        return res.status(400).json({ message: 'User is already a member' });
      }
    } else if (action === 'remove') {
      group.members = group.members.filter(id => id.toString() !== memberId);

      // Remove from admins if necessary
      if (group.admins.includes(memberId)) {
        group.admins = group.admins.filter(id => id.toString() !== memberId);
      }
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await group.save();
    res.json({ message: 'Group members updated', data: group });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const manageAdmins = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { action, adminId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if the user performing the action is an admin
    if (!group.admins.includes(req.user.id)) {
      return res.status(403).json({ message: 'Only admins can manage other admins' });
    }

    // Check if the user to be promoted/demoted is a member of the group
    if (!group.members.includes(adminId)) {
      return res.status(400).json({ message: 'User is not a member of the group' });
    }

    if (action === 'promote') {
      if (!group.admins.includes(adminId)) {
        group.admins.push(adminId);
      } else {
        return res.status(400).json({ message: 'User is already an admin' });
      }
    } else if (action === 'demote') {
      if (group.admins.length === 1 && group.admins.includes(adminId)) {
        return res.status(400).json({ message: 'Cannot demote the last admin' });
      }
      group.admins = group.admins.filter(id => id.toString() !== adminId);
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await group.save();
    res.json({ message: 'Admin status updated', data: group });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const fetchGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('members admins', 'name');
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
};
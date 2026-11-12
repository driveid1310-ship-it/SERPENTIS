import type { Response, Request } from 'express';
import { Group } from '../models/Group.js';
import { GroupMember } from '../models/GroupMember.js';
import { GroupMessage } from '../models/GroupMessage.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { escapeRegex } from '../utils/regex.js';

export const createGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const group = await Group.create({
      name,
      description,
      category,
      creator: userId,
      memberCount: 1, // Creator is the first member
    });

    await GroupMember.create({
      group: group._id,
      user: userId,
      role: 'admin',
    });

    res.status(201).json(group);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create group' });
  }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;

    const query: any = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: escapeRegex(search), $options: 'i' };

    const groups = await Group.find(query).sort({ memberCount: -1, createdAt: -1 }).limit(50);
    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch groups' });
  }
};

export const getGroupDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const group = await Group.findById(id).populate('creator', 'fullName profilePicture');
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    const membership = userId ? await GroupMember.findOne({ group: id, user: userId }) : null;

    res.status(200).json({
      group,
      membership: membership ? { role: membership.role, joinedAt: membership.createdAt } : null,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch group details' });
  }
};

export const joinGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const group = await Group.findById(id);
    if (!group) {
      res.status(404).json({ message: 'Group not found' });
      return;
    }

    const existingMembership = await GroupMember.findOne({ group: id, user: userId });
    if (existingMembership) {
      res.status(400).json({ message: 'Already a member' });
      return;
    }

    await GroupMember.create({ group: id, user: userId, role: 'member' });
    group.memberCount += 1;
    await group.save();

    res.status(200).json({ message: 'Joined successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to join group' });
  }
};

export const leaveGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const membership = await GroupMember.findOneAndDelete({ group: id, user: userId });
    if (!membership) {
      res.status(400).json({ message: 'Not a member' });
      return;
    }

    await Group.findByIdAndUpdate(id, { $inc: { memberCount: -1 } });

    res.status(200).json({ message: 'Left successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to leave group' });
  }
};

export const getGroupMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Check membership
    const isMember = await GroupMember.exists({ group: id, user: userId });
    if (!isMember) {
      res.status(403).json({ message: 'Must be a member to view messages' });
      return;
    }

    const messages = await GroupMessage.find({ group: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'fullName profilePicture')
      .populate('sharedReport', 'title category status location');

    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

export const getGroupMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const members = await GroupMember.find({ group: id })
      .populate('user', 'fullName profilePicture')
      .sort({ role: 1, createdAt: 1 })
      .limit(100);

    res.status(200).json(members);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

export const getMyGroups = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const memberships = await GroupMember.find({ user: userId }).select('group').lean();
    const groupIds = memberships.map(m => m.group);

    const groups = await Group.find({ _id: { $in: groupIds } })
      .sort({ memberCount: -1, createdAt: -1 })
      .lean();

    res.status(200).json(groups);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch your groups' });
  }
};

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Group } from '../models/Group.js';
import { GroupMember } from '../models/GroupMember.js';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/serpentis';

const seedGroups = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find any admin or user to be the creator
    const creator = await User.findOne({ role: 'admin' }) || await User.findOne();
    if (!creator) {
      console.log('No users found. Please register a user first.');
      process.exit(1);
    }

    const demoGroups = [
      {
        name: 'Mumbai Civic Action',
        description: 'A community group for coordinating civic improvements and cleanup drives across Mumbai.',
        category: 'Civic',
      },
      {
        name: 'Heritage Walkers',
        description: 'Discussing and organizing weekend walks to historical forts and monuments.',
        category: 'Heritage',
      },
      {
        name: 'Local Safety Watch',
        description: 'Neighborhood watch group focusing on infrastructure and safety hazards.',
        category: 'Safety',
      }
    ];

    for (const data of demoGroups) {
      const existing = await Group.findOne({ name: data.name });
      if (!existing) {
        const group = await Group.create({
          ...data,
          creator: creator._id,
          memberCount: 1,
        });
        await GroupMember.create({
          group: group._id,
          user: creator._id,
          role: 'admin',
        });
        console.log(`Created group: ${data.name}`);
      } else {
        console.log(`Group already exists: ${data.name}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding groups:', error);
    process.exit(1);
  }
};

seedGroups();

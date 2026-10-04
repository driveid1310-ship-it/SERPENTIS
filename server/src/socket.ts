import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { GroupMember } from './models/GroupMember.js';
import { GroupMessage } from './models/GroupMessage.js';
import Report from './models/Report.js';
import User from './models/User.js';

interface SocketUser {
  id: string;
}

export function setupSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust in production
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      if (!decoded || !decoded.userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await User.findById(decoded.userId).select('_id fullName profilePicture');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      (socket as any).user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`Socket connected: ${user.fullName} (${user._id})`);

    // Join a group room
    socket.on('joinGroup', async (groupId: string) => {
      // Authorize
      const isMember = await GroupMember.exists({ group: groupId, user: user._id });
      if (isMember) {
        socket.join(groupId);
        console.log(`User ${user.fullName} joined group ${groupId}`);
      } else {
        socket.emit('error', 'Not authorized to join this group chat');
      }
    });

    // Leave a group room
    socket.on('leaveGroup', (groupId: string) => {
      socket.leave(groupId);
    });

    // Send a message (optionally with a shared report reference)
    socket.on('sendMessage', async (data: { groupId: string; text: string; sharedReport?: string }, callback?: (res: any) => void) => {
      try {
        const { groupId, text, sharedReport } = data;
        const hasText = text && text.trim() !== '';
        if (!groupId || (!hasText && !sharedReport)) {
           if (callback) callback({ success: false, error: 'Empty message' });
           return;
        }

        // Verify membership
        const isMember = await GroupMember.exists({ group: groupId, user: user._id });
        if (!isMember) {
          socket.emit('error', 'Not authorized to send messages in this group');
          if (callback) callback({ success: false, error: 'Not authorized' });
          return;
        }

        // Validate shared report if provided
        let validatedReportId: string | undefined;
        if (sharedReport) {
          const reportExists = await Report.findById(sharedReport).select('_id').lean();
          if (reportExists) {
            validatedReportId = sharedReport;
          }
        }

        // Save to DB
        const messageText = hasText ? text.trim() : '📋 Shared a civic report';
        const message = await GroupMessage.create({
          group: groupId,
          sender: user._id,
          text: messageText,
          ...(validatedReportId ? { sharedReport: validatedReportId } : {}),
        });

        // Populate shared report for broadcast
        if (validatedReportId) {
          await message.populate('sharedReport', 'title category status location');
        }

        // Broadcast to room
        io.to(groupId).emit('newMessage', {
          _id: message._id,
          group: message.group,
          sender: {
            _id: user._id,
            fullName: user.fullName,
            profilePicture: (user as any).profilePicture,
          },
          text: message.text,
          sharedReport: message.sharedReport || undefined,
          createdAt: message.createdAt,
        });

        if (callback) callback({ success: true });
      } catch (err) {
        socket.emit('error', 'Failed to send message');
        if (callback) callback({ success: false, error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${user.fullName}`);
    });
  });

  return io;
}

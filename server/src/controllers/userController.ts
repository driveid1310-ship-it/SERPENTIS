import type { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import Report from '../models/Report.js';
import Comment from '../models/Comment.js';

export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await User.find()
      .select('fullName reputationPoints trustScore resolvedReports badges profilePicture')
      .sort({ reputationPoints: -1, trustScore: -1, resolvedReports: -1 });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user.toObject(),
    }));

    res.status(200).json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
}

export async function getMyContributions(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
       res.status(401).json({ success: false, message: 'Unauthorized' });
       return;
    }

    const reports = await Report.find({ reportedBy: userId }).select('category status createdAt').lean();
    const comments = await Comment.find({ user: userId }).populate('report', 'category').select('content report createdAt').lean();

    const contributions: any[] = [];

    reports.forEach((r) => {
      contributions.push({ id: r._id, type: 'REPORT', title: `Reported ${r.category}`, status: r.status, date: r.createdAt });
    });

    comments.forEach((c) => {
      const cat = (c.report as any)?.category || 'a report';
      contributions.push({ id: c._id, type: 'COMMENT', title: `Commented on ${cat}`, date: c.createdAt });
    });

    contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.status(200).json({ success: true, data: { contributions } });
  } catch (error) {
    next(error);
  }
}

export async function getMyBadges(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
       res.status(401).json({ success: false, message: 'Unauthorized' });
       return;
    }
    const user = await User.findById(userId).select('totalReports resolvedReports trustScore reputationPoints');
    
    if (!user) {
       res.status(404).json({ success: false, message: 'User not found' });
       return;
    }

    const ALL_BADGES = [
      { id: 'contributor', name: 'Contributor', icon: '🏅', description: 'Made your first civic report', requirement: 'Submit at least 1 report', earned: user.totalReports >= 1 },
      { id: 'active-guardian', name: 'Active Guardian', icon: '⭐', description: 'Consistently reporting civic issues', requirement: 'Submit 5+ reports OR reach 100 Trust', earned: user.totalReports >= 5 || user.trustScore >= 100 },
      { id: 'community-guardian', name: 'Community Guardian', icon: '🛡️', description: 'Your reports are resolving real problems', requirement: 'Have 1+ resolved report OR reach 250 Trust', earned: user.resolvedReports >= 1 || user.trustScore >= 250 },
      { id: 'city-champion', name: 'City Champion', icon: '🏆', description: 'Elite civic contributor', requirement: 'Have 5+ resolved reports OR reach 500 Trust', earned: user.resolvedReports >= 5 || user.trustScore >= 500 }
    ];

    res.status(200).json({ success: true, data: { badges: ALL_BADGES } });
  } catch (error) {
    next(error);
  }
}

import { type Request, type Response, type NextFunction } from 'express';
import { Types } from 'mongoose';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function createComment(
  req: AuthenticatedRequest & { params: { reportId: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const { reportId } = req.params;
    const { content } = req.body;

    if (!Types.ObjectId.isValid(reportId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Comment must be at least 2 characters.',
      });
      return;
    }

    const report = await Report.findById(reportId);

    if (!report) {
      res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
      return;
    }

    const comment = await Comment.create({
      content: content.trim(),
      report: reportId,
      user: req.userId,
    });

    const populatedComment = await comment.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComments(
  req: Request<{ reportId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reportId } = req.params;

    if (!Types.ObjectId.isValid(reportId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid report ID.',
      });
      return;
    }

    const comments = await Comment.find({ report: reportId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(
  req: AuthenticatedRequest & { params: { commentId: string } },
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
      return;
    }

    const { commentId } = req.params;

    if (!Types.ObjectId.isValid(commentId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid comment ID.',
      });
      return;
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
      return;
    }

    if (comment.user.toString() !== req.userId) {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
      return;
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
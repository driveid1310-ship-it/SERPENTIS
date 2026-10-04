import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import type { Report } from '../types/report';
import type { Comment } from '../types/comment';
import {
  fetchReportById,
  fetchComments,
  postComment,
  addUpvote,
  removeUpvote,
  toggleObservation as toggleObservationService,
} from '../services/reportService';
import { useAuth } from './useAuth';

export function useReportDetails(reportId: string) {
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const isUpvoted =
    user && report ? report.upvotes.includes(user.id) : false;

  const loadData = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const [fetchedReport, fetchedComments] = await Promise.all([
        fetchReportById(reportId),
        fetchComments(reportId),
      ]);
      setReport(fetchedReport);
      setComments(fetchedComments);
      setStatus('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to load report.',
      );
      setStatus('error');
    }
  }, [reportId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitComment = useCallback(
    async (content: string) => {
      setCommentError(null);
      setIsPostingComment(true);
      try {
        const newComment = await postComment(reportId, content);
        setComments((prev) => [newComment, ...prev]);
        return true;
      } catch (error) {
        setCommentError(
          error instanceof Error ? error.message : 'Unable to post comment.',
        );
        return false;
      } finally {
        setIsPostingComment(false);
      }
    },
    [reportId],
  );

  const isObserved = Boolean(user && report?.personallyObserved?.includes(user.id));

  const toggleObservation = useCallback(async () => {
    if (!user || !report) return;

    const previousObs = report.personallyObserved || [];
    const newObs = isObserved
      ? previousObs.filter((id) => id !== user.id)
      : [...previousObs, user.id];

    setReport({ ...report, personallyObserved: newObs });

    try {
      await toggleObservationService(report._id);
    } catch {
      // Revert on failure
      setReport({ ...report, personallyObserved: previousObs });
      Alert.alert('Error', 'Failed to update observation.');
    }
  }, [user, report, isObserved]);

  const toggleUpvote = useCallback(async () => {
    if (!user || !report) return;

    const previousUpvotes = [...report.upvotes];
    const newUpvotes = isUpvoted
      ? previousUpvotes.filter((id) => id !== user.id)
      : [...previousUpvotes, user.id];

    setReport({ ...report, upvotes: newUpvotes });

    try {
      if (isUpvoted) {
        await removeUpvote(report._id);
      } else {
        await addUpvote(report._id);
      }
    } catch {
      // Revert on failure
      setReport({ ...report, upvotes: previousUpvotes });
    }
  }, [user, report, isUpvoted]);

  const changeStatus = useCallback(async (newStatus: import('../types/report').ReportStatus) => {
    if (!report) return false;
    try {
      const { updateReportStatusMod, updateReportCreator } = await import('../services/reportService');
      const updated = user?.role === 'moderator' || user?.role === 'admin' 
        ? await updateReportStatusMod(report._id, newStatus)
        : await updateReportCreator(report._id, { status: newStatus });
      setReport(updated);
      return true;
    } catch {
      return false;
    }
  }, [report, user]);

  return {
    report,
    comments,
    status,
    errorMessage,
    isPostingComment,
    commentError,
    isUpvoted,
    isObserved,
    retry: loadData,
    submitComment,
    toggleUpvote,
    toggleObservation,
    changeStatus,
  };
}

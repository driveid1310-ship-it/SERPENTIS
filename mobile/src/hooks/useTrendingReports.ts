import { useCallback, useEffect, useState } from 'react';
import {
  fetchTrendingReports,
  addUpvote,
  removeUpvote,
  ReportServiceError,
} from '../services/reportService';
import type { Report } from '../types/report';

export type TrendingReportsStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseTrendingReportsResult {
  status: TrendingReportsStatus;
  reports: Report[];
  errorMessage: string | null;
  refetch: () => void;
  toggleUpvote: (report: Report, currentUserId: string) => Promise<void>;
}

export function useTrendingReports(): UseTrendingReportsResult {
  const [status, setStatus] = useState<TrendingReportsStatus>('loading');
  const [reports, setReports] = useState<Report[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [pendingUpvoteReportIds, setPendingUpvoteReportIds] = useState<
    Set<string>
  >(new Set());

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchTrendingReports()
      .then((result) => {
        if (!isActive) {
          return;
        }
        setReports(result);
        setStatus(result.length === 0 ? 'empty' : 'success');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setReports([]);
        setStatus('error');
        setErrorMessage(
          error instanceof ReportServiceError
            ? error.message
            : 'Something went wrong while loading trending reports.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  const toggleUpvote = useCallback(
    async (report: Report, currentUserId: string) => {
      if (pendingUpvoteReportIds.has(report._id)) {
        return;
      }

      const hasUpvoted = report.upvotes.includes(currentUserId);

      setPendingUpvoteReportIds((previous) => {
        const next = new Set(previous);
        next.add(report._id);
        return next;
      });

      try {
        if (hasUpvoted) {
          await removeUpvote(report._id);
        } else {
          await addUpvote(report._id);
        }

        setReports((previous) =>
          previous.map((item) => {
            if (item._id !== report._id) {
              return item;
            }
            return {
              ...item,
              upvotes: hasUpvoted
                ? item.upvotes.filter((id) => id !== currentUserId)
                : [...item.upvotes, currentUserId],
            };
          }),
        );
      } catch {
        // Request failed — leave existing state untouched rather than
        // optimistically changing the count, no separate error UI invented.
      } finally {
        setPendingUpvoteReportIds((previous) => {
          const next = new Set(previous);
          next.delete(report._id);
          return next;
        });
      }
    },
    [pendingUpvoteReportIds],
  );

  return { status, reports, errorMessage, refetch, toggleUpvote };
}

export default useTrendingReports;

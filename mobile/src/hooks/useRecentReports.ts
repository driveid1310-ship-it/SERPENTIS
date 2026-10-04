import { useCallback, useEffect, useState } from 'react';
import { fetchRecentReports, ReportServiceError } from '../services/reportService';
import type { Report } from '../types/report';

export type RecentReportsStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseRecentReportsResult {
  status: RecentReportsStatus;
  reports: Report[];
  errorMessage: string | null;
  refetch: () => void;
}

export function useRecentReports(): UseRecentReportsResult {
  const [status, setStatus] = useState<RecentReportsStatus>('loading');
  const [reports, setReports] = useState<Report[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchRecentReports()
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
            : 'Something went wrong while loading recent reports.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  return { status, reports, errorMessage, refetch };
}

export default useRecentReports;

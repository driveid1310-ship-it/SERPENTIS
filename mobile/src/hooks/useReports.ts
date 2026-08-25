import { useCallback, useState } from 'react';
import { submitReport, ReportServiceError } from '../services/reportService';
import type { CreateReportPayload, Report } from '../types/report';

export type ReportSubmissionStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error';

interface UseReportsResult {
  status: ReportSubmissionStatus;
  errorMessage: string | null;
  submittedReport: Report | null;
  submit: (payload: CreateReportPayload) => Promise<void>;
  reset: () => void;
}

export function useReports(): UseReportsResult {
  const [status, setStatus] = useState<ReportSubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null);

  const submit = useCallback(async (payload: CreateReportPayload) => {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const report = await submitReport(payload);
      setSubmittedReport(report);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof ReportServiceError
          ? error.message
          : 'Something went wrong while submitting your report.',
      );
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setErrorMessage(null);
    setSubmittedReport(null);
  }, []);

  return { status, errorMessage, submittedReport, submit, reset };
}

export default useReports;

import axios from 'axios';
import { createReportRequest } from '../api/reports';
import type { CreateReportPayload, Report } from '../types/report';

export class ReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: unknown } | undefined;

    if (
      data &&
      typeof data.message === 'string' &&
      data.message.trim().length > 0
    ) {
      return data.message;
    }

    if (!error.response) {
      return 'Unable to reach the server. Please check your connection and try again.';
    }
  }

  return fallback;
}

export async function submitReport(
  payload: CreateReportPayload,
): Promise<Report> {
  try {
    const response = await createReportRequest(payload);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.report;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(
        error,
        'Unable to submit your report. Please try again.',
      ),
    );
  }
}

import axios from 'axios';
import {
  createSosAlertRequest,
  getAllSosAlertsRequest,
} from '../api/sos';
import type { CreateSOSPayload, SOSAlert } from '../types/sos';

export class SosServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SosServiceError';
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

export async function fetchActiveSosAlerts(): Promise<SOSAlert[]> {
  try {
    const response = await getAllSosAlertsRequest();

    if (!response.success) {
      throw new SosServiceError(response.message);
    }

    return response.data.sos;
  } catch (error) {
    if (error instanceof SosServiceError) {
      throw error;
    }
    throw new SosServiceError(
      extractErrorMessage(
        error,
        'Unable to load active SOS alerts. Please try again.',
      ),
    );
  }
}

export async function createSosAlert(
  payload: CreateSOSPayload,
): Promise<SOSAlert> {
  try {
    const response = await createSosAlertRequest(payload);

    if (!response.success) {
      throw new SosServiceError(response.message);
    }

    return response.data.sos;
  } catch (error) {
    if (error instanceof SosServiceError) {
      throw error;
    }
    throw new SosServiceError(
      extractErrorMessage(error, 'Unable to send the SOS alert. Please try again.'),
    );
  }
}

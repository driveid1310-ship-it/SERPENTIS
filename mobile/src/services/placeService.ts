import axios from 'axios';
import {
  getAllPublicServicesRequest,
  getPublicServicesByCategoryRequest,
} from '../api/publicServices';
import type { PublicService, ServiceCategory } from '../types/publicService';

export class PlaceServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlaceServiceError';
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

export async function fetchPublicServices(
  category: ServiceCategory | null,
): Promise<PublicService[]> {
  try {
    const response = category
      ? await getPublicServicesByCategoryRequest(category)
      : await getAllPublicServicesRequest();

    if (!response.success) {
      throw new PlaceServiceError(response.message);
    }

    return response.data.services;
  } catch (error) {
    if (error instanceof PlaceServiceError) {
      throw error;
    }
    throw new PlaceServiceError(
      extractErrorMessage(
        error,
        'Unable to load nearby places. Please try again.',
      ),
    );
  }
}

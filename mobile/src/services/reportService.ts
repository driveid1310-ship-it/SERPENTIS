import axios from 'axios';
import type { Asset } from 'react-native-image-picker';
import {
  createReportRequest,
  getAllReportsRequest,
  getNearbyReportsRequest,
  upvoteReportRequest,
  toggleObservationRequest,
  removeUpvoteRequest,
  uploadReportImageRequest,
  getReportByIdRequest,
  getCommentsRequest,
  createCommentRequest,
} from '../api/reports';
import type { CreateReportPayload, Report } from '../types/report';
import type { Comment } from '../types/comment';

export class ReportServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

export class ReportImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReportImageUploadError';
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

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const FILE_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function uploadReportImage(asset: Asset): Promise<string> {
  if (!asset.uri) {
    throw new ReportImageUploadError(
      'The selected photo could not be accessed. Please select it again.',
    );
  }

  const extension = asset.fileName?.split('.').pop()?.toLowerCase();
  const mimeType =
    asset.type?.toLowerCase() ??
    (extension ? MIME_TYPE_BY_EXTENSION[extension] : undefined);
  const fileExtension = mimeType
    ? FILE_EXTENSION_BY_MIME_TYPE[mimeType]
    : undefined;

  if (!mimeType || !fileExtension) {
    throw new ReportImageUploadError(
      'Choose a JPEG, PNG, or WebP image.',
    );
  }

  const formData = new FormData();
  formData.append('image', {
    uri: asset.uri,
    name: asset.fileName || `report-photo.${fileExtension}`,
    type: mimeType,
  });

  try {
    const response = await uploadReportImageRequest(formData);

    if (!response.success) {
      throw new ReportImageUploadError(response.message);
    }

    if (
      typeof response.data.url !== 'string' ||
      !/^https?:\/\//i.test(response.data.url)
    ) {
      throw new ReportImageUploadError(
        'The server returned an invalid image URL. Please try again.',
      );
    }

    return response.data.url;
  } catch (error) {
    if (error instanceof ReportImageUploadError) {
      throw error;
    }
    throw new ReportImageUploadError(
      extractErrorMessage(
        error,
        'Unable to upload this photo. Please try again.',
      ),
    );
  }
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

export async function fetchTrendingReports(): Promise<Report[]> {
  try {
    const response = await getAllReportsRequest({
      sort: 'most-upvoted',
      limit: 5,
    });

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.reports;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(
        error,
        'Unable to load trending reports. Please try again.',
      ),
    );
  }
}

export async function fetchRecentReports(): Promise<Report[]> {
  try {
    const response = await getAllReportsRequest({
      sort: 'latest',
      limit: 5,
    });

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.reports;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(
        error,
        'Unable to load recent reports. Please try again.',
      ),
    );
  }
}

export async function fetchNearbyReports(
  longitude: number,
  latitude: number,
  distanceMeters: number,
): Promise<Report[]> {
  try {
    const response = await getNearbyReportsRequest({
      lng: longitude,
      lat: latitude,
      distance: distanceMeters,
    });

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.reports;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }

    throw new ReportServiceError(
      extractErrorMessage(
        error,
        'Unable to load nearby reports. Please try again.',
      ),
    );
  }
}

export async function addUpvote(reportId: string): Promise<number> {
  try {
    const response = await upvoteReportRequest(reportId);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.upvotes;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(error, 'Unable to upvote this report.'),
    );
  }
}

export async function removeUpvote(reportId: string): Promise<number> {
  try {
    const response = await removeUpvoteRequest(reportId);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.upvotes;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(error, 'Unable to remove your upvote.'),
    );
  }
}

export async function fetchReportById(reportId: string): Promise<Report> {
  try {
    const response = await getReportByIdRequest(reportId);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.report;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(error, 'Unable to load report details.'),
    );
  }
}

export async function fetchComments(reportId: string): Promise<Comment[]> {
  try {
    const response = await getCommentsRequest(reportId);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(error, 'Unable to load comments.'),
    );
  }
}

export async function postComment(
  reportId: string,
  content: string,
): Promise<Comment> {
  try {
    const response = await createCommentRequest(reportId, content);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError(
      extractErrorMessage(error, 'Unable to post comment.'),
    );
  }
}
export async function updateReportCreator(reportId: string, payload: Partial<Report>): Promise<Report> {
  const { updateReportRequest } = await import('../api/reports');
  const res = await updateReportRequest(reportId, payload);
  if (res.success && 'data' in res) return res.data.report;
  throw new Error(res.message);
}

export async function updateReportStatusMod(reportId: string, status: import('../types/report').ReportStatus): Promise<Report> {
  const { updateReportStatusModeratorRequest } = await import('../api/reports');
  const res = await updateReportStatusModeratorRequest(reportId, status);
  if (res.success && 'data' in res) return res.data.report;
  throw new Error(res.message);
}

export async function updateReportPriorityMod(reportId: string, priority: import('../types/report').ReportSeverity): Promise<Report> {
  const { updateReportPriorityModeratorRequest } = await import('../api/reports');
  const res = await updateReportPriorityModeratorRequest(reportId, priority);
  if (res.success && 'data' in res) return res.data.report;
  throw new Error(res.message);
}

export async function toggleObservation(reportId: string): Promise<number> {
  try {
    const response = await toggleObservationRequest(reportId);

    if (!response.success) {
      throw new ReportServiceError(response.message);
    }

    return response.data.personallyObserved;
  } catch (error) {
    if (error instanceof ReportServiceError) {
      throw error;
    }
    throw new ReportServiceError('An unexpected error occurred while toggling observation.');
  }
}

import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type { CreateReportPayload, Report, ReportStatus, ReportSeverity } from '../types/report';
import type { Comment } from '../types/comment';

export async function createReportRequest(
  payload: CreateReportPayload,
): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.post<ApiResponse<{ report: Report }>>(
    '/reports',
    payload,
  );

  return response.data;
}

export async function uploadReportImageRequest(
  formData: FormData,
): Promise<ApiResponse<{ url: string }>> {
  const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
    '/reports/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
}

export async function getAllReportsRequest(params: {
  sort?: string;
  limit?: number;
}): Promise<ApiResponse<{ reports: Report[] }>> {
  const response = await axiosInstance.get<ApiResponse<{ reports: Report[] }>>(
    '/reports',
    { params },
  );

  return response.data;
}

export async function getNearbyReportsRequest(params: {
  lng: number;
  lat: number;
  distance: number;
}): Promise<ApiResponse<{ reports: Report[] }>> {
  const response = await axiosInstance.get<ApiResponse<{ reports: Report[] }>>(
    '/reports/near',
    { params },
  );

  return response.data;
}

export async function upvoteReportRequest(
  id: string,
): Promise<ApiResponse<{ upvotes: number }>> {
  const response = await axiosInstance.post<ApiResponse<{ upvotes: number }>>(
    `/reports/${id}/upvote`,
  );

  return response.data;
}
export async function toggleObservationRequest(
  id: string,
): Promise<ApiResponse<{ personallyObserved: number }>> {
  const response = await axiosInstance.post<ApiResponse<{ personallyObserved: number }>>(
    `/reports/${id}/observe`,
  );
  return response.data;
}


export async function removeUpvoteRequest(
  id: string,
): Promise<ApiResponse<{ upvotes: number }>> {
  const response = await axiosInstance.delete<
    ApiResponse<{ upvotes: number }>
  >(`/reports/${id}/upvote`);

  return response.data;
}

export async function getReportByIdRequest(
  id: string,
): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.get<ApiResponse<{ report: Report }>>(
    `/reports/${id}`,
  );

  return response.data;
}

export async function getCommentsRequest(
  reportId: string,
): Promise<ApiResponse<Comment[]>> {
  const response = await axiosInstance.get<ApiResponse<Comment[]>>(
    `/comments/${reportId}`,
  );

  return response.data;
}

export async function createCommentRequest(
  reportId: string,
  content: string,
): Promise<ApiResponse<Comment>> {
  const response = await axiosInstance.post<ApiResponse<Comment>>(
    `/comments/${reportId}`,
    { content },
  );

  return response.data;
}
export type CityStats = { totalReports: number, pending: number, inProgress: number, resolved: number, verified: number, byCategory: {category: string, count: number}[] };
export async function getCityStatsRequest(): Promise<ApiResponse<CityStats>> {
  const response = await axiosInstance.get<ApiResponse<CityStats>>('/reports/stats');
  return response.data;
}
export async function updateReportRequest(reportId: string, payload: Partial<Report>): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.put<ApiResponse<{ report: Report }>>(`/reports/${reportId}`, payload);
  return response.data;
}

export async function updateReportStatusModeratorRequest(reportId: string, status: ReportStatus): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.patch<ApiResponse<{ report: Report }>>(`/reports/${reportId}/status`, { status });
  return response.data;
}

export async function verifyReportModeratorRequest(reportId: string, verified: boolean): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.patch<ApiResponse<{ report: Report }>>(`/reports/${reportId}/verify`, { verified });
  return response.data;
}

export async function updateReportPriorityModeratorRequest(reportId: string, priority: ReportSeverity): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.patch<ApiResponse<{ report: Report }>>(`/reports/${reportId}/priority`, { priority });
  return response.data;
}

export async function updateOfficialFilingRequest(
  reportId: string,
  payload: {
    status?: 'not_filed' | 'filed_by_citizen';
    docketNumber?: string;
    filingDate?: string;
    channelName?: string;
  },
): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.patch<ApiResponse<{ report: Report }>>(
    `/reports/${reportId}/official-filing`,
    payload,
  );
  return response.data;
}

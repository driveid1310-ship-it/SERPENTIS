import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type { CreateReportPayload, Report } from '../types/report';

/**
 * Raw HTTP calls to the backend's /api/reports routes.
 * See backend: src/routes/reportRoutes.ts, src/controllers/reportController.ts
 */

export async function createReportRequest(
  payload: CreateReportPayload,
): Promise<ApiResponse<{ report: Report }>> {
  const response = await axiosInstance.post<ApiResponse<{ report: Report }>>(
    '/reports',
    payload,
  );

  return response.data;
}

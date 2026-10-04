import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type { CreateSOSPayload, SOSAlert } from '../types/sos';

interface SOSListData {
  sos: SOSAlert[];
  count: number;
}

export async function getAllSosAlertsRequest(): Promise<
  ApiResponse<SOSListData>
> {
  const response = await axiosInstance.get<ApiResponse<SOSListData>>('/sos');

  return response.data;
}

export async function createSosAlertRequest(
  payload: CreateSOSPayload,
): Promise<ApiResponse<{ sos: SOSAlert }>> {
  const response = await axiosInstance.post<ApiResponse<{ sos: SOSAlert }>>(
    '/sos',
    payload,
  );

  return response.data;
}

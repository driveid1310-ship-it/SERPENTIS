import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type { UpdateCurrentUserPayload, User } from '../types/user';

export async function updateCurrentUserRequest(
	payload: UpdateCurrentUserPayload,
): Promise<ApiResponse<{ user: User }>> {
	const response = await axiosInstance.patch<ApiResponse<{ user: User }>>(
		'/auth/me',
		payload,
	);

	return response.data;
}

export async function getLeaderboardRequest(): Promise<ApiResponse<{ leaderboard: any[] }>> {
  const response = await axiosInstance.get<ApiResponse<{ leaderboard: any[] }>>('/users/leaderboard');
  return response.data;
}
export async function getMyContributionsRequest(): Promise<ApiResponse<{ contributions: any[] }>> {
  const response = await axiosInstance.get<ApiResponse<{ contributions: any[] }>>('/users/me/contributions');
  return response.data;
}

export async function getMyBadgesRequest(): Promise<ApiResponse<{ badges: any[] }>> {
  const response = await axiosInstance.get<ApiResponse<{ badges: any[] }>>('/users/me/badges');
  return response.data;
}

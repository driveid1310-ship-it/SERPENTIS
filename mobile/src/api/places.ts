import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type {
  Place,
  PlaceCategory,
  PlacePagination,
  PlaceFavorite,
  PlaceReview,
} from '../types/place';

interface PlacesData {
  places: Place[];
  pagination?: PlacePagination;
}

export async function getAllPlacesRequest(): Promise<ApiResponse<PlacesData>> {
  const response = await axiosInstance.get<ApiResponse<PlacesData>>('/places');

  return response.data;
}

export async function getPlacesByCategoryRequest(
  category: PlaceCategory,
): Promise<ApiResponse<PlacesData>> {
  const response = await axiosInstance.get<ApiResponse<PlacesData>>(
    `/places/category/${category}`,
  );

  return response.data;
}

export async function getFavoritePlacesRequest(): Promise<
  ApiResponse<{ favorites: PlaceFavorite[] }>
> {
  const response = await axiosInstance.get<
    ApiResponse<{ favorites: PlaceFavorite[] }>
  >('/places/favorites');

  return response.data;
}

export async function favoritePlaceRequest(
  id: string,
): Promise<ApiResponse<undefined>> {
  const response = await axiosInstance.post<ApiResponse<undefined>>(
    `/places/${id}/favorite`,
  );

  return response.data;
}

export async function unfavoritePlaceRequest(
  id: string,
): Promise<ApiResponse<undefined>> {
  const response = await axiosInstance.delete<ApiResponse<undefined>>(
    `/places/${id}/favorite`,
  );

  return response.data;
}

export async function createPlaceReviewRequest(
  id: string,
  payload: { rating: number; comment: string },
): Promise<ApiResponse<{ review: PlaceReview }>> {
  const response = await axiosInstance.post<
    ApiResponse<{ review: PlaceReview }>
  >(`/places/${id}/review`, payload);

  return response.data;
}

export async function getMyPlaceReviewsRequest(): Promise<
  ApiResponse<{ reviews: PlaceReview[] }>
> {
  const response = await axiosInstance.get<
    ApiResponse<{ reviews: PlaceReview[] }>
  >('/places/reviews');

  return response.data;
}

import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type {
  PublicService,
  PublicServicePagination,
  ServiceCategory,
} from '../types/publicService';

interface PublicServicesData {
  services: PublicService[];
  pagination: PublicServicePagination;
}

export async function getAllPublicServicesRequest(): Promise<
  ApiResponse<PublicServicesData>
> {
  const response = await axiosInstance.get<ApiResponse<PublicServicesData>>(
    '/public-services',
  );

  return response.data;
}

export async function getPublicServicesByCategoryRequest(
  category: ServiceCategory,
): Promise<ApiResponse<PublicServicesData>> {
  const response = await axiosInstance.get<ApiResponse<PublicServicesData>>(
    `/public-services/category/${category}`,
  );

  return response.data;
}

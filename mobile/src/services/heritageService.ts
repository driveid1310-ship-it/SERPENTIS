import axios from 'axios';
import {
  getAllPlacesRequest,
  getPlacesByCategoryRequest,
  getFavoritePlacesRequest,
  favoritePlaceRequest,
  unfavoritePlaceRequest,
  createPlaceReviewRequest,
  getMyPlaceReviewsRequest,
} from '../api/places';
import type { Place, PlaceCategory } from '../types/place';

export class HeritageServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HeritageServiceError';
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

export async function fetchHeritagePlaces(
  category: PlaceCategory | null,
): Promise<Place[]> {
  try {
    const response = category
      ? await getPlacesByCategoryRequest(category)
      : await getAllPlacesRequest();

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }

    return response.data.places;
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(
        error,
        'Unable to load heritage spots. Please try again.',
      ),
    );
  }
}

export async function fetchFavoritePlaceIds(): Promise<string[]> {
  try {
    const response = await getFavoritePlacesRequest();

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }

    return response.data.favorites.map((favorite) => favorite.place._id);
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(
        error,
        'Unable to load your favorite heritage spots.',
      ),
    );
  }
}

export async function addFavorite(placeId: string): Promise<void> {
  try {
    const response = await favoritePlaceRequest(placeId);

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(error, 'Unable to add this place to favorites.'),
    );
  }
}

export async function removeFavorite(placeId: string): Promise<void> {
  try {
    const response = await unfavoritePlaceRequest(placeId);

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(
        error,
        'Unable to remove this place from favorites.',
      ),
    );
  }
}

export async function fetchMyPlaceReviewIds(): Promise<string[]> {
  try {
    const response = await getMyPlaceReviewsRequest();

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }

    return response.data.reviews.flatMap((review) => {
      if (typeof review.place === 'string') {
        return [review.place];
      }

      return review.place?._id ? [review.place._id] : [];
    });
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(
        error,
        'Unable to check your existing place reviews.',
      ),
    );
  }
}

export async function submitPlaceReview(
  placeId: string,
  rating: number,
  comment: string,
): Promise<void> {
  try {
    const response = await createPlaceReviewRequest(placeId, {
      rating,
      comment,
    });

    if (!response.success) {
      throw new HeritageServiceError(response.message);
    }
  } catch (error) {
    if (error instanceof HeritageServiceError) {
      throw error;
    }
    throw new HeritageServiceError(
      extractErrorMessage(error, 'Unable to submit your place review.'),
    );
  }
}

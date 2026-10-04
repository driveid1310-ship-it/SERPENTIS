import { useCallback, useEffect, useState } from 'react';
import {
  fetchHeritagePlaces,
  fetchFavoritePlaceIds,
  addFavorite,
  removeFavorite,
  HeritageServiceError,
} from '../services/heritageService';
import type { Place, PlaceCategory } from '../types/place';

export type HeritageStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseHeritageResult {
  status: HeritageStatus;
  places: Place[];
  errorMessage: string | null;
  refetch: () => void;
  favoritedPlaceIds: Set<string>;
  toggleFavorite: (place: Place) => Promise<void>;
}

export function useHeritage(category: PlaceCategory | null): UseHeritageResult {
  const [status, setStatus] = useState<HeritageStatus>('loading');
  const [places, setPlaces] = useState<Place[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [favoritedPlaceIds, setFavoritedPlaceIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingFavoriteIds, setPendingFavoriteIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchHeritagePlaces(category)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setPlaces(result);
        setStatus(result.length === 0 ? 'empty' : 'success');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setPlaces([]);
        setStatus('error');
        setErrorMessage(
          error instanceof HeritageServiceError
            ? error.message
            : 'Something went wrong while loading heritage spots.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [category, refetchIndex]);

  // Favorited state is independent of category filtering, so it's fetched
  // once rather than re-fetched on every category change. A failure here
  // is non-fatal to the screen — it just leaves favorited state empty
  // rather than blocking the main places list.
  useEffect(() => {
    let isActive = true;

    fetchFavoritePlaceIds()
      .then((ids) => {
        if (!isActive) {
          return;
        }
        setFavoritedPlaceIds(new Set(ids));
      })
      .catch(() => {
        // Silent — favorited state simply stays empty on failure.
      });

    return () => {
      isActive = false;
    };
  }, []);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  const toggleFavorite = useCallback(
    async (place: Place) => {
      if (pendingFavoriteIds.has(place._id)) {
        return;
      }

      const isFavorited = favoritedPlaceIds.has(place._id);

      setPendingFavoriteIds((previous) => {
        const next = new Set(previous);
        next.add(place._id);
        return next;
      });

      try {
        if (isFavorited) {
          await removeFavorite(place._id);
        } else {
          await addFavorite(place._id);
        }

        setFavoritedPlaceIds((previous) => {
          const next = new Set(previous);
          if (isFavorited) {
            next.delete(place._id);
          } else {
            next.add(place._id);
          }
          return next;
        });

        setPlaces((previous) =>
          previous.map((item) => {
            if (item._id !== place._id) {
              return item;
            }
            return {
              ...item,
              favorites: isFavorited
                ? Math.max(item.favorites - 1, 0)
                : item.favorites + 1,
            };
          }),
        );
      } catch {
        // Request failed — leave existing state untouched, no
        // optimistic change made before success.
      } finally {
        setPendingFavoriteIds((previous) => {
          const next = new Set(previous);
          next.delete(place._id);
          return next;
        });
      }
    },
    [favoritedPlaceIds, pendingFavoriteIds],
  );

  return {
    status,
    places,
    errorMessage,
    refetch,
    favoritedPlaceIds,
    toggleFavorite,
  };
}

export default useHeritage;

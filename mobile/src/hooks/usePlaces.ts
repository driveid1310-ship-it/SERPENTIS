import { useCallback, useEffect, useState } from 'react';
import { fetchPublicServices, PlaceServiceError } from '../services/placeService';
import type { PublicService, ServiceCategory } from '../types/publicService';

export type PlacesStatus = 'loading' | 'success' | 'empty' | 'error';

interface UsePlacesResult {
  status: PlacesStatus;
  services: PublicService[];
  errorMessage: string | null;
  refetch: () => void;
}

export function usePlaces(category: ServiceCategory | null): UsePlacesResult {
  const [status, setStatus] = useState<PlacesStatus>('loading');
  const [services, setServices] = useState<PublicService[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchPublicServices(category)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setServices(result);
        setStatus(result.length === 0 ? 'empty' : 'success');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setServices([]);
        setStatus('error');
        setErrorMessage(
          error instanceof PlaceServiceError
            ? error.message
            : 'Something went wrong while loading places.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [category, refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  return { status, services, errorMessage, refetch };
}

export default usePlaces;

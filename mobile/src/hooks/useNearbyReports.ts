import { useCallback, useEffect, useRef, useState } from 'react';
import { NEARBY_REPORTS_RADIUS_METERS } from '../config/map';
import { fetchNearbyReports, ReportServiceError } from '../services/reportService';
import type { GeoJSONPoint, Report } from '../types/report';

export type NearbyReportsStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'empty'
  | 'error';

interface UseNearbyReportsResult {
  reports: Report[];
  status: NearbyReportsStatus;
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
}

export function useNearbyReports(
  location?: GeoJSONPoint | null,
): UseNearbyReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<NearbyReportsStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const lastRequestKey = useRef<string | null>(null);
  const activeRequestKey = useRef<string | null>(null);
  const isMounted = useRef(false);

  const longitude = location?.coordinates?.[0];
  const latitude = location?.coordinates?.[1];
  const hasLocation = location !== null && location !== undefined;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLocation) {
      activeRequestKey.current = null;
      lastRequestKey.current = null;
      setReports([]);
      setStatus('idle');
      setErrorMessage(null);
      return;
    }

    if (
      typeof longitude !== 'number' ||
      typeof latitude !== 'number' ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude)
    ) {
      activeRequestKey.current = null;
      setReports([]);
      setStatus('error');
      setErrorMessage('The current location is invalid.');
      return;
    }

    const requestKey = `${longitude},${latitude}:${retryAttempt}`;
    activeRequestKey.current = requestKey;

    if (lastRequestKey.current === requestKey) {
      return;
    }

    lastRequestKey.current = requestKey;
    setReports([]);
    setStatus('loading');
    setErrorMessage(null);

    fetchNearbyReports(
      longitude,
      latitude,
      NEARBY_REPORTS_RADIUS_METERS,
    )
      .then((nearbyReports) => {
        if (
          !isMounted.current ||
          activeRequestKey.current !== requestKey
        ) {
          return;
        }

        setReports(nearbyReports);
        setStatus(nearbyReports.length > 0 ? 'success' : 'empty');
      })
      .catch((error: unknown) => {
        if (
          !isMounted.current ||
          activeRequestKey.current !== requestKey
        ) {
          return;
        }

        setReports([]);
        setStatus('error');
        setErrorMessage(
          error instanceof ReportServiceError
            ? error.message
            : 'Unable to load nearby reports. Please try again.',
        );
      });
  }, [hasLocation, latitude, longitude, retryAttempt]);

  const retry = useCallback(() => {
    setRetryAttempt((previous) => previous + 1);
  }, []);

  return {
    reports,
    status,
    isLoading: status === 'loading',
    errorMessage,
    retry,
  };
}

export default useNearbyReports;

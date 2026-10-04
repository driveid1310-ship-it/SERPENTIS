import { useCallback, useEffect, useState } from 'react';
import { fetchActiveSosAlerts, SosServiceError } from '../services/sosService';
import type { SOSAlert } from '../types/sos';

export type SosAlertsStatus = 'loading' | 'success' | 'empty' | 'error';

interface UseSosResult {
  status: SosAlertsStatus;
  alerts: SOSAlert[];
  errorMessage: string | null;
  refetch: () => void;
}

export function useSos(): UseSosResult {
  const [status, setStatus] = useState<SosAlertsStatus>('loading');
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    setStatus('loading');
    setErrorMessage(null);

    fetchActiveSosAlerts()
      .then((result) => {
        if (!isActive) {
          return;
        }
        setAlerts(result);
        setStatus(result.length === 0 ? 'empty' : 'success');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }
        setAlerts([]);
        setStatus('error');
        setErrorMessage(
          error instanceof SosServiceError
            ? error.message
            : 'Something went wrong while loading active SOS alerts.',
        );
      });

    return () => {
      isActive = false;
    };
  }, [refetchIndex]);

  const refetch = useCallback(() => {
    setRefetchIndex((previous) => previous + 1);
  }, []);

  return { status, alerts, errorMessage, refetch };
}

export default useSos;

import { useCallback, useState } from 'react';
import type { GeoJSONPoint } from '../types/report';

export type LocationStatus = 'idle' | 'checking' | 'unavailable';

interface UseLocationResult {
  location: GeoJSONPoint | null;
  status: LocationStatus;
  message: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const NATIVE_INTEGRATION_PENDING_MESSAGE =
  "Location capture isn't wired up yet in this build. Native GPS integration is a planned follow-up.";

/**
 * UI-only integration point for device location.
 *
 * TODO(native-integration): replace the body of requestLocation with a real
 * call to a geolocation library (e.g. @react-native-community/geolocation)
 * once one is approved and added to package.json. This hook intentionally
 * never fabricates coordinates — until native integration lands, requesting
 * a location always resolves to the 'unavailable' status below so the UI
 * degrades honestly instead of pretending to have a real fix.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoJSONPoint | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    setStatus('unavailable');
    setMessage(NATIVE_INTEGRATION_PENDING_MESSAGE);
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setMessage(null);
  }, []);

  return { location, status, message, requestLocation, clearLocation };
}

export default useLocation;

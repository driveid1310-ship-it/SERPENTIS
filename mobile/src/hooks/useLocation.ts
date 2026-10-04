import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type {
  GeolocationError,
  GeolocationResponse,
} from '@react-native-community/geolocation';
import type { GeoJSONPoint } from '../types/report';

export type LocationStatus = 'idle' | 'checking' | 'available' | 'unavailable';

interface UseLocationResult {
  location: GeoJSONPoint | null;
  status: LocationStatus;
  message: string | null;
  requestLocation: () => void;
  clearLocation: () => void;
}

const PERMISSION_DENIED_MESSAGE =
  "Location permission was denied, so this report can't include your current location.";
const POSITION_UNAVAILABLE_MESSAGE =
  'Your current location could not be determined. Check that GPS/location services are enabled and try again.';

const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 10000,
};

/**
 * Requests the device's current position and exposes it as a GeoJSON point.
 *
 * Permission is requested explicitly before reading a position, and the
 * hook still never fabricates coordinates: any denial or failure resolves
 * to the 'unavailable' status with an honest message, same as the previous
 * stub.
 *
 * JS-layer only: native permission declarations (AndroidManifest.xml /
 * Info.plist) aren't part of this build yet, so the permission prompts
 * below can't be exercised on a device or emulator until that follow-up
 * batch adds them.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<GeoJSONPoint | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handlePositionSuccess = useCallback(
    (position: GeolocationResponse) => {
      const { latitude, longitude } = position.coords;
      // GeoJSON coordinate order is [longitude, latitude] — the reverse of
      // the library's {latitude, longitude} field order. Converted
      // explicitly here so this never gets transposed by accident.
      const point: GeoJSONPoint = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      setLocation(point);
      setStatus('available');
      setMessage(null);
    },
    [],
  );

  const handlePositionError = useCallback((error: GeolocationError) => {
    setStatus('unavailable');
    setMessage(error.message || POSITION_UNAVAILABLE_MESSAGE);
  }, []);

  const fetchPosition = useCallback(() => {
    Geolocation.getCurrentPosition(
      handlePositionSuccess,
      handlePositionError,
      GEOLOCATION_OPTIONS,
    );
  }, [handlePositionSuccess, handlePositionError]);

  const requestLocation = useCallback(() => {
    setStatus('checking');
    setMessage(null);

    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      )
        .then((result) => {
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            fetchPosition();
          } else {
            setStatus('unavailable');
            setMessage(PERMISSION_DENIED_MESSAGE);
          }
        })
        .catch(() => {
          setStatus('unavailable');
          setMessage(PERMISSION_DENIED_MESSAGE);
        });
      return;
    }

    Geolocation.requestAuthorization(fetchPosition, () => {
      setStatus('unavailable');
      setMessage(PERMISSION_DENIED_MESSAGE);
    });
  }, [fetchPosition]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setMessage(null);
  }, []);

  return { location, status, message, requestLocation, clearLocation };
}

export default useLocation;

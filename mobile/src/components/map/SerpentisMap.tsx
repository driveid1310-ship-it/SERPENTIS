import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
} from '@maplibre/maplibre-react-native';
import type { GeoJSONPoint } from '../../types/report';
import type { Report } from '../../types/report';
import type { Place } from '../../types/place';
import type { PublicService } from '../../types/publicService';
import { useTheme } from '../../context/ThemeContext';
import {
  MAP_TEST_INITIAL_COORDINATE,
  MAP_TEST_INITIAL_ZOOM,
  OPENFREEMAP_STYLE_URL,
} from '../../config/map';

interface SerpentisMapProps {
  location?: GeoJSONPoint | null;
  reports?: Report[];
  places?: Place[];
  services?: PublicService[];
  onReportMarkerPress?: (report: Report) => void;
  onPlaceMarkerPress?: (place: Place) => void;
  onServiceMarkerPress?: (service: PublicService) => void;
  initialCoordinate?: [number, number];
  targetCoordinate?: [number, number];
  targetMarkerId?: string;
  initialZoom?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SerpentisMap({
  location,
  reports,
  places,
  services,
  onReportMarkerPress,
  onPlaceMarkerPress,
  onServiceMarkerPress,
  initialCoordinate = MAP_TEST_INITIAL_COORDINATE,
  targetCoordinate,
  targetMarkerId,
  initialZoom = MAP_TEST_INITIAL_ZOOM,
  style,
}: SerpentisMapProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const cameraRef = useRef<CameraRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

  const currentCoordinate =
    location &&
    location.coordinates.length === 2 &&
    location.coordinates.every(Number.isFinite)
      ? location.coordinates
      : null;
  const longitude = currentCoordinate?.[0];
  const latitude = currentCoordinate?.[1];
  const currentLocationFeature = useMemo(
    () => {
      if (longitude === undefined || latitude === undefined) {
        return null;
      }

      return {
        type: 'FeatureCollection' as const,
        features: [
          {
            type: 'Feature' as const,
            id: 'serpentis-current-location',
            properties: {},
            geometry: {
              type: 'Point' as const,
              coordinates: [longitude, latitude] as [number, number],
            },
          },
        ],
      };
    },
    [latitude, longitude],
  );

  const reportMarkers = useMemo(
    () =>
      reports?.flatMap((report) => {
        const coordinates: unknown = report.location?.coordinates;
        if (
          !Array.isArray(coordinates) ||
          coordinates.length !== 2 ||
          !coordinates.every(
            (coordinate) =>
              typeof coordinate === 'number' && Number.isFinite(coordinate),
          )
        ) {
          return [];
        }

        return [
          <Marker
            key={report._id}
            id={report._id}
            lngLat={coordinates as [number, number]}
            onPress={() => onReportMarkerPress?.(report)}
          >
            <View style={styles.reportMarker} />
          </Marker>,
        ];
      }) ?? [],
    [onReportMarkerPress, reports, styles.reportMarker],
  );


  const placeMarkers = useMemo(
    () =>
      places?.flatMap((place) => {
        const coordinates: unknown = place.location?.coordinates;
        if (
          !Array.isArray(coordinates) ||
          coordinates.length !== 2 ||
          !coordinates.every(
            (coordinate) =>
              typeof coordinate === 'number' && Number.isFinite(coordinate),
          )
        ) {
          return [];
        }

        return [
          <Marker
            key={place._id}
            id={place._id}
            lngLat={coordinates as [number, number]}
            onPress={() => onPlaceMarkerPress?.(place)}
          >
            <View style={styles.placeMarker} />
          </Marker>,
        ];
      }) ?? [],
    [onPlaceMarkerPress, places, styles.placeMarker],
  );

  const serviceMarkers = useMemo(
    () =>
      services?.flatMap((service) => {
        const coordinates: unknown = service.location?.coordinates;
        if (
          !Array.isArray(coordinates) ||
          coordinates.length !== 2 ||
          !coordinates.every(
            (coordinate) =>
              typeof coordinate === 'number' && Number.isFinite(coordinate),
          )
        ) {
          return [];
        }

        return [
          <Marker
            key={service._id}
            id={service._id}
            lngLat={coordinates as [number, number]}
            onPress={() => onServiceMarkerPress?.(service)}
          >
            <View style={styles.serviceMarker} />
          </Marker>,
        ];
      }) ?? [],
    [onServiceMarkerPress, services, styles.serviceMarker],
  );

  useEffect(() => {

    if (!isMapReady) return;
    
    const centerLon = targetCoordinate?.[0] ?? longitude;
    const centerLat = targetCoordinate?.[1] ?? latitude;

    if (centerLon === undefined || centerLat === undefined) {
      return;
    }

    cameraRef.current?.easeTo({
      center: [centerLon, centerLat],
      zoom: initialZoom,
      duration: 500,
    });
  }, [initialZoom, isMapReady, latitude, longitude, targetCoordinate]);

  const handleMapLoaded = () => {
    setMapLoadFailed(false);
    setIsMapReady(true);
  };

  const handleMapLoadFailed = () => {
    setIsMapReady(false);
    setMapLoadFailed(true);
  };

  return (
    <View style={[styles.container, style]}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={OPENFREEMAP_STYLE_URL}
        attribution
        logo
        dragPan
        touchZoom
        doubleTapZoom
        onDidFinishLoadingMap={handleMapLoaded}
        onDidFailLoadingMap={handleMapLoadFailed}
      >
        <Camera
          ref={cameraRef}
          initialViewState={{
            center: currentCoordinate ?? initialCoordinate,
            zoom: initialZoom,
          }}
        />
        {currentLocationFeature ? (
          <GeoJSONSource
            id="serpentis-current-location-source"
            data={currentLocationFeature}
          >
            <Layer
              id="serpentis-current-location-layer"
              type="circle"
              paint={{
                'circle-color': theme.colors.accent,
                'circle-radius': 9,
                'circle-stroke-color': theme.colors.background,
                'circle-stroke-width': 3,
              }}
            />
          </GeoJSONSource>
        ) : null}
        
        {targetCoordinate ? (
          <Marker
            key={targetMarkerId ?? 'target-place-marker'} id={targetMarkerId ?? 'target-place-marker'}
            lngLat={targetCoordinate}
          >
            <View style={styles.targetMarker}>
              <Text style={styles.targetMarkerIcon}>dY"?</Text>
            </View>
          </Marker>
        ) : null}

        {reportMarkers}
        {placeMarkers}
        {serviceMarkers}
      </Map>

      {!isMapReady && !mapLoadFailed ? (
        <View pointerEvents="none" style={styles.mapStatus}>
          <ActivityIndicator color={theme.colors.accent} size="small" />
          <Text style={styles.mapStatusText}>Loading map...</Text>
        </View>
      ) : null}

      {mapLoadFailed ? (
        <View pointerEvents="none" style={styles.mapStatus}>
          <Text style={styles.mapStatusText}>
            Map tiles could not load. Check your connection and retry.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  reportMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: theme.colors.background,
    backgroundColor: theme.colors.surface,
  },

  placeMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.background,
    backgroundColor: '#9C27B0', // purple for places/heritage
  },
  serviceMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.background,
    backgroundColor: '#0288D1', // blue for services
  },
  targetMarker: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  targetMarkerIcon: {
    fontSize: 16,
  },
  mapStatus: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    maxWidth: '90%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  mapStatusText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes?.xs ?? 12,
  },
});

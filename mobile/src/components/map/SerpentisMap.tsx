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
import type { GeoJSONPoint, Report } from '../../types/report';
import type { Place } from '../../types/place';
import type { PublicService } from '../../types/publicService';
import type { MapLayersData } from '../../types/environment';
import { useTheme } from '../../context/ThemeContext';
import {
  MAP_TEST_INITIAL_COORDINATE,
  MAP_TEST_INITIAL_ZOOM,
  OPENFREEMAP_STYLE_URL,
} from '../../config/map';

export interface EnvironmentalPinSelection {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  coordinates: [number, number];
}

interface SerpentisMapProps {
  location?: GeoJSONPoint | null;
  reports?: Report[];
  places?: Place[];
  services?: PublicService[];
  weatherPin?: MapLayersData['weatherPin'] | null;
  airQualityGrid?: MapLayersData['airQualityGrid'] | null;
  aqiStations?: MapLayersData['layers']['aqiStations'];
  envMarkers?: Array<{
    _id: string;
    title: string;
    category: string;
    status?: string;
    location: { coordinates: [number, number] };
    kind: 'pollution' | 'garbage' | 'water' | 'waterlogging' | 'green';
  }>;
  onReportMarkerPress?: (report: Report) => void;
  onPlaceMarkerPress?: (place: Place) => void;
  onServiceMarkerPress?: (service: PublicService) => void;
  onEnvMarkerPress?: (item: EnvironmentalPinSelection) => void;
  initialCoordinate?: [number, number];
  targetCoordinate?: [number, number];
  targetMarkerId?: string;
  initialZoom?: number;
  style?: StyleProp<ViewStyle>;
}

const ENV_KIND_COLOR: Record<string, string> = {
  pollution: '#F97316',
  garbage: '#EAB308',
  water: '#06B6D4',
  waterlogging: '#3B82F6',
  green: '#22C55E',
};

export default function SerpentisMap({
  location,
  reports,
  places,
  services,
  weatherPin,
  airQualityGrid,
  aqiStations,
  envMarkers,
  onReportMarkerPress,
  onPlaceMarkerPress,
  onServiceMarkerPress,
  onEnvMarkerPress,
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
  const currentLocationFeature = useMemo(() => {
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
  }, [latitude, longitude]);

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
            key={`rep-${report._id}`}
            id={`rep-${report._id}`}
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
            key={`plc-${place._id}`}
            id={`plc-${place._id}`}
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
            key={`svc-${service._id}`}
            id={`svc-${service._id}`}
            lngLat={coordinates as [number, number]}
            onPress={() => onServiceMarkerPress?.(service)}
          >
            <View style={styles.serviceMarker} />
          </Marker>,
        ];
      }) ?? [],
    [onServiceMarkerPress, services, styles.serviceMarker],
  );

  const stationMarkers = useMemo(
    () =>
      aqiStations?.flatMap((st) => {
        const coords = st.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return [];
        return [
          <Marker
            key={`st-${st._id}`}
            id={`st-${st._id}`}
            lngLat={coords}
            onPress={() =>
              onEnvMarkerPress?.({
                id: st._id,
                title: st.name,
                subtitle: `${st.provider} (${st.reliabilityTier})`,
                badge: 'OFFICIAL STATION',
                color: '#00F0FF',
                coordinates: coords,
              })
            }
          >
            <View style={styles.stationMarker} />
          </Marker>,
        ];
      }) ?? [],
    [aqiStations, onEnvMarkerPress, styles.stationMarker],
  );

  const envLayerMarkers = useMemo(
    () =>
      envMarkers?.flatMap((item) => {
        const coords = item.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return [];
        const color = ENV_KIND_COLOR[item.kind] || '#F97316';
        return [
          <Marker
            key={`env-${item.kind}-${item._id}`}
            id={`env-${item.kind}-${item._id}`}
            lngLat={coords}
            onPress={() =>
              onEnvMarkerPress?.({
                id: item._id,
                title: item.title,
                subtitle: `Category: ${item.category}${item.status ? ` • ${item.status}` : ''}`,
                badge: item.kind === 'green' ? 'GREEN SPACE' : 'CITIZEN REPORT',
                color,
                coordinates: coords,
              })
            }
          >
            <View style={[styles.envCircleMarker, { backgroundColor: color }]} />
          </Marker>,
        ];
      }) ?? [],
    [envMarkers, onEnvMarkerPress, styles.envCircleMarker],
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
            key={targetMarkerId ?? 'target-place-marker'}
            id={targetMarkerId ?? 'target-place-marker'}
            lngLat={targetCoordinate}
          >
            <View style={styles.targetMarker}>
              <Text style={styles.targetMarkerIcon}>📍</Text>
            </View>
          </Marker>
        ) : null}

        {weatherPin ? (
          <Marker
            key="weather-grid-pin"
            id="weather-grid-pin"
            lngLat={weatherPin.coordinates}
            onPress={() =>
              onEnvMarkerPress?.({
                id: 'weather-grid',
                title: `${weatherPin.temperatureC.toFixed(1)}°C • ${weatherPin.condition}`,
                subtitle: `Humidity ${weatherPin.humidityPct}% • ${weatherPin.provider}`,
                badge: `${weatherPin.dataType.toUpperCase()} WEATHER`,
                color: '#00F0FF',
                coordinates: weatherPin.coordinates,
              })
            }
          >
            <View style={styles.climatePillMarker}>
              <Text style={styles.climatePillText}>
                {Math.round(weatherPin.temperatureC)}°C
                {airQualityGrid?.overallAqi !== null && airQualityGrid?.overallAqi !== undefined
                  ? ` | AQI ${airQualityGrid.overallAqi}`
                  : ''}
              </Text>
            </View>
          </Marker>
        ) : null}

        {reportMarkers}
        {placeMarkers}
        {serviceMarkers}
        {stationMarkers}
        {envLayerMarkers}
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

const getStyles = (theme: any) =>
  StyleSheet.create({
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
      backgroundColor: '#9C27B0',
    },
    serviceMarker: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.background,
      backgroundColor: '#0288D1',
    },
    stationMarker: {
      width: 18,
      height: 18,
      borderRadius: 3,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      backgroundColor: '#00F0FF',
    },
    envCircleMarker: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    climatePillMarker: {
      backgroundColor: 'rgba(10, 10, 10, 0.88)',
      borderWidth: 1.5,
      borderColor: '#00F0FF',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    climatePillText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 'bold',
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

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import SerpentisMap, {
  type EnvironmentalPinSelection,
} from '../components/map/SerpentisMap';
import { MAP_TEST_INITIAL_ZOOM } from '../config/map';
import { useNearbyReports } from '../hooks/useNearbyReports';
import { usePlaces } from '../hooks/usePlaces';
import { useHeritage } from '../hooks/useHeritage';
import type { Place } from '../types/place';
import type { PublicService, ServiceCategory } from '../types/publicService';
import { useLocation } from '../hooks/useLocation';
import type { MainTabParamList, RootStackParamList } from '../navigation/AppNavigator';
import type { Report, ReportStatus } from '../types/report';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getMapLayersRequest } from '../api/environment';
import type { MapLayersData } from '../types/environment';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';

type MapScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Map'>,
  NativeStackScreenProps<RootStackParamList>
>;

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

function formatRelativeTime(createdAt: string): string {
  const createdTimestamp = new Date(createdAt).getTime();
  if (Number.isNaN(createdTimestamp)) return '';
  const elapsedMs = Date.now() - createdTimestamp;
  if (elapsedMs < MINUTE_MS) return 'Just now';
  if (elapsedMs < HOUR_MS) return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  if (elapsedMs < DAY_MS) return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

function MapPreviewImage({ uri, styles }: { uri: string; styles: any }) {
  const [error, setError] = useState(false);

  if (!uri || typeof uri !== 'string' || uri.trim() === '' || error) {
    return null;
  }

  return (
    <Image
      source={{ uri: uri.trim() }}
      style={styles.previewImage}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

interface LayerToggles {
  climatePin: boolean;
  aqiStations: boolean;
  civicReports: boolean;
  pollution: boolean;
  garbage: boolean;
  water: boolean;
  waterlogging: boolean;
  greenSpaces: boolean;
  publicServices: boolean;
  heritage: boolean;
}

const DEFAULT_LAYERS: LayerToggles = {
  climatePin: true,
  aqiStations: true,
  civicReports: true,
  pollution: true,
  garbage: true,
  water: true,
  waterlogging: true,
  greenSpaces: true,
  publicServices: true,
  heritage: true,
};

export default function MapScreen({ navigation, route }: MapScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();
  const { location, status, message, requestLocation } = useLocation();
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory | null>(null);
  const { services: publicServices } = usePlaces(serviceCategory);
  const { places: heritagePlacesRaw } = useHeritage(null);

  const {
    reports,
    status: nearbyStatus,
    isLoading: areReportsLoading,
    errorMessage: nearbyError,
    retry: retryNearbyReports,
  } = useNearbyReports(location);

  const [mapLayers, setMapLayers] = useState<MapLayersData | null>(null);
  const [layers, setLayers] = useState<LayerToggles>(DEFAULT_LAYERS);
  const [layersModalVisible, setLayersModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedPlace, setSelectedPlace] = useState(route.params?.targetPlace);
  const [selectedEnvPin, setSelectedEnvPin] =
    useState<EnvironmentalPinSelection | null>(null);
  const insets = useSafeAreaInsets();

  const loadSmartCityLayers = useCallback(async () => {
    try {
      const res = await getMapLayersRequest({
        slug: selectedCity.slug,
        lat: location?.coordinates[1],
        lon: location?.coordinates[0],
      });
      if (res.success && 'data' in res) {
        setMapLayers(res.data);
      }
    } catch {
      // keep existing map layers cleanly
    }
  }, [location, selectedCity.slug]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    loadSmartCityLayers();
  }, [loadSmartCityLayers]);

  const toggleLayer = useCallback((key: keyof LayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handlePlaceMarkerPress = useCallback((place: Place) => {
    setSelectedReport(null);
    setSelectedEnvPin(null);
    setSelectedPlace({
      id: place._id,
      name: place.name,
      category: place.category as string,
      coordinates: place.location.coordinates,
      address: place.address,
    });
  }, []);

  const handleServiceMarkerPress = useCallback((service: PublicService) => {
    setSelectedReport(null);
    setSelectedEnvPin(null);
    setSelectedPlace({
      id: service._id,
      name: service.name,
      category: service.category as string,
      coordinates: service.location.coordinates,
      address: service.address,
    });
  }, []);

  const handleReportMarkerPress = useCallback((report: Report) => {
    setSelectedPlace(undefined);
    setSelectedEnvPin(null);
    setSelectedReport(report);
  }, []);

  const handleEnvMarkerPress = useCallback((item: EnvironmentalPinSelection) => {
    setSelectedReport(null);
    setSelectedPlace(undefined);
    setSelectedEnvPin(item);
  }, []);

  const handleClosePreviewPress = useCallback(() => {
    setSelectedReport(null);
    setSelectedPlace(undefined);
    setSelectedEnvPin(null);
  }, []);

  const handleRetryNearbyPress = useCallback(() => {
    setSelectedReport(null);
    retryNearbyReports();
    loadSmartCityLayers();
  }, [retryNearbyReports, loadSmartCityLayers]);

  const handleGetDirections = useCallback(async () => {
    if (!selectedPlace?.coordinates || selectedPlace.coordinates.length < 2) {
      Alert.alert('Error', 'Invalid coordinates for this place.');
      return;
    }
    const [longitude, latitude] = selectedPlace.coordinates;

    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      Alert.alert('Error', 'Invalid coordinate bounds.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'Could not open Maps application.');
    }
  }, [selectedPlace]);

  const envMarkers = useMemo(() => {
    if (!mapLayers) return [];
    const list: Array<{
      _id: string;
      title: string;
      category: string;
      status?: string;
      location: { coordinates: [number, number] };
      kind: 'pollution' | 'garbage' | 'water' | 'waterlogging' | 'green';
    }> = [];

    if (layers.pollution) {
      mapLayers.layers.pollutionHotspots.forEach((r) =>
        list.push({ ...r, kind: 'pollution' }),
      );
    }
    if (layers.garbage) {
      mapLayers.layers.garbageHotspots.forEach((r) =>
        list.push({ ...r, kind: 'garbage' }),
      );
    }
    if (layers.water) {
      mapLayers.layers.waterContamination.forEach((r) =>
        list.push({ ...r, kind: 'water' }),
      );
    }
    if (layers.waterlogging) {
      mapLayers.layers.waterlogging.forEach((r) =>
        list.push({ ...r, kind: 'waterlogging' }),
      );
    }
    if (layers.greenSpaces) {
      mapLayers.layers.greenSpaces.forEach((p) =>
        list.push({
          _id: p._id,
          title: p.name,
          category: p.category,
          location: p.location,
          kind: 'green',
        }),
      );
    }
    return list;
  }, [layers, mapLayers]);

  const cityInitialCoord: [number, number] = [
    selectedCity.longitude,
    selectedCity.latitude,
  ];

  return (
    <View style={styles.container}>
      <SerpentisMap
        location={location}
        reports={layers.civicReports ? reports : []}
        places={layers.heritage && serviceCategory === null ? heritagePlacesRaw : []}
        services={layers.publicServices ? publicServices : []}
        weatherPin={layers.climatePin ? mapLayers?.weatherPin : null}
        airQualityGrid={layers.climatePin ? mapLayers?.airQualityGrid : null}
        aqiStations={layers.aqiStations ? mapLayers?.layers.aqiStations : []}
        envMarkers={envMarkers}
        onReportMarkerPress={handleReportMarkerPress}
        onPlaceMarkerPress={handlePlaceMarkerPress}
        onServiceMarkerPress={handleServiceMarkerPress}
        onEnvMarkerPress={handleEnvMarkerPress}
        initialCoordinate={cityInitialCoord}
        initialZoom={selectedPlace ? 15 : MAP_TEST_INITIAL_ZOOM}
        targetCoordinate={selectedPlace?.coordinates}
        targetMarkerId={selectedPlace?.id}
      />

      <View
        style={[styles.topControls, { top: Math.max(insets.top, 16) }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonIcon}>{'←'}</Text>
        </Pressable>

        <View style={styles.statusContainer} pointerEvents="box-none">
          {status === 'checking' || areReportsLoading ? (
            <View style={styles.statusPill}>
              <ActivityIndicator color={theme.colors.primary} size="small" />
              <Text style={styles.statusText}>Syncing map...</Text>
            </View>
          ) : null}

          {status === 'unavailable' ? (
            <View style={styles.statusPillError}>
              <Text style={styles.errorText} numberOfLines={1}>
                {message ?? 'GPS Unavailable'}
              </Text>
              <Pressable onPress={requestLocation} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          {nearbyStatus === 'error' ? (
            <View style={styles.statusPillError}>
              <Text style={styles.errorText} numberOfLines={1}>
                {nearbyError ?? 'Failed to load reports'}
              </Text>
              <Pressable onPress={handleRetryNearbyPress} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setLayersModalVisible(true)}
              style={[styles.statusPill, styles.layersButton]}
            >
              <Text style={[styles.statusText, styles.layersButtonText]}>
                🗺️ Layers & Legend
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('CitySelector')}
              style={styles.statusPill}
            >
              <Text style={styles.statusText}>{selectedCity.name} ▾</Text>
            </Pressable>
          </View>

          <View style={styles.filterRow}>
            <Pressable
              onPress={() => setServiceCategory(null)}
              style={[
                styles.statusPill,
                serviceCategory === null && styles.activeFilterPill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  serviceCategory === null && styles.activeFilterText,
                ]}
              >
                All
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setServiceCategory('hospital')}
              style={[
                styles.statusPill,
                serviceCategory === 'hospital' && styles.activeFilterPill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  serviceCategory === 'hospital' && styles.activeFilterText,
                ]}
              >
                Hospitals
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setServiceCategory('police')}
              style={[
                styles.statusPill,
                serviceCategory === 'police' && styles.activeFilterPill,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  serviceCategory === 'police' && styles.activeFilterText,
                ]}
              >
                Police
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={layersModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLayersModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <AppCard style={styles.modalCard}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Smart City Map Layers & Legend</Text>
              <Pressable
                onPress={() => setLayersModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {(
                [
                  { key: 'climatePin', label: 'Weather & Modeled AQI Pill', color: '#00F0FF', shape: 'Pill' },
                  { key: 'aqiStations', label: 'Official AQI Monitoring Stations', color: '#00F0FF', shape: 'Square' },
                  { key: 'pollution', label: 'Air / Industrial / Smoke Hotspots', color: '#F97316', shape: 'Circle' },
                  { key: 'garbage', label: 'Garbage / Dumping Hotspots', color: '#EAB308', shape: 'Circle' },
                  { key: 'water', label: 'Water Contamination Reports', color: '#06B6D4', shape: 'Circle' },
                  { key: 'waterlogging', label: 'Waterlogging / Flood Risk Reports', color: '#3B82F6', shape: 'Circle' },
                  { key: 'greenSpaces', label: 'Parks & Green Spaces', color: '#22C55E', shape: 'Circle' },
                  { key: 'civicReports', label: 'All Civic Reports', color: '#FFFFFF', shape: 'Circle' },
                  { key: 'publicServices', label: 'Hospitals & Public Services', color: '#0288D1', shape: 'Circle' },
                  { key: 'heritage', label: 'Heritage Landmarks', color: '#9C27B0', shape: 'Circle' },
                ] as const
              ).map((item) => {
                const active = layers[item.key];
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => toggleLayer(item.key)}
                    style={styles.layerToggleRow}
                  >
                    <View style={styles.layerLeft}>
                      <View
                        style={[
                          styles.legendDot,
                          {
                            backgroundColor: item.color,
                            borderRadius: item.shape === 'Square' ? 3 : 8,
                          },
                        ]}
                      />
                      <Text style={styles.layerLabel}>{item.label}</Text>
                    </View>
                    <Text
                      style={[
                        styles.toggleBadge,
                        active ? styles.toggleOn : styles.toggleOff,
                      ]}
                    >
                      {active ? 'ON' : 'OFF'}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </AppCard>
        </View>
      </Modal>

      {selectedReport || selectedPlace || selectedEnvPin ? (
        <SafeAreaView
          edges={['bottom']}
          pointerEvents="box-none"
          style={styles.previewOverlay}
        >
          <View pointerEvents="auto" style={styles.previewContainer}>
            {selectedReport ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('ReportDetails', {
                    reportId: selectedReport._id,
                  })
                }
              >
                <AppCard elevation="lg" style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <View style={styles.previewTitleContainer}>
                      <Text style={styles.previewTitle} numberOfLines={2}>
                        {selectedReport.title}
                      </Text>
                      <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>
                            {selectedReport.category}
                          </Text>
                        </View>
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusBadgeText}>
                            {REPORT_STATUS_LABELS[selectedReport.status] ||
                              selectedReport.status}
                          </Text>
                        </View>
                        <Text style={styles.dateText}>
                          • {formatRelativeTime(selectedReport.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      hitSlop={10}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleClosePreviewPress();
                      }}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeIcon}>✕</Text>
                    </Pressable>
                  </View>

                  {selectedReport.description ? (
                    <Text style={styles.previewDescription} numberOfLines={2}>
                      {selectedReport.description}
                    </Text>
                  ) : null}

                  {selectedReport.images && selectedReport.images[0] ? (
                    <MapPreviewImage
                      uri={selectedReport.images[0]}
                      styles={styles}
                    />
                  ) : null}
                </AppCard>
              </Pressable>
            ) : selectedPlace ? (
              <AppCard elevation="lg" style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewTitleContainer}>
                    <Text style={styles.previewTitle} numberOfLines={2}>
                      {selectedPlace.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {selectedPlace.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    hitSlop={10}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleClosePreviewPress();
                    }}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeIcon}>✕</Text>
                  </Pressable>
                </View>
                {selectedPlace.address ? (
                  <Text style={styles.previewDescription} numberOfLines={2}>
                    {selectedPlace.address}
                  </Text>
                ) : null}
                <View style={styles.placeActionContainer}>
                  <AppButton label="Get Directions" onPress={handleGetDirections} />
                </View>
              </AppCard>
            ) : selectedEnvPin ? (
              <AppCard elevation="lg" style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewTitleContainer}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{selectedEnvPin.badge}</Text>
                    </View>
                    <Text style={styles.previewTitle} numberOfLines={2}>
                      {selectedEnvPin.title}
                    </Text>
                  </View>
                  <Pressable
                    hitSlop={10}
                    onPress={handleClosePreviewPress}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeIcon}>✕</Text>
                  </Pressable>
                </View>
                <Text style={styles.previewDescription}>{selectedEnvPin.subtitle}</Text>
              </AppCard>
            ) : null}
          </View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    topControls: {
      position: 'absolute',
      left: theme.spacing.md,
      right: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      zIndex: 10,
    },
    backButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonIcon: { fontSize: 20, color: theme.colors.text, fontWeight: 'bold' },
    pressed: { opacity: 0.7 },
    statusContainer: { flex: 1, alignItems: 'flex-end', gap: 6, marginLeft: theme.spacing.md },
    filterRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.round,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
    },
    layersButton: { borderColor: theme.colors.primary },
    layersButtonText: { color: theme.colors.primary, fontWeight: 'bold' },
    activeFilterPill: { borderColor: theme.colors.primary },
    activeFilterText: { color: theme.colors.primary },
    statusPillError: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.round,
      borderWidth: 1,
      borderColor: '#EF4444',
      gap: 6,
    },
    statusText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
    errorText: { fontSize: 11, color: '#EF4444', maxWidth: 150 },
    retryButton: { marginLeft: 4, paddingHorizontal: 4 },
    retryText: { fontSize: 11, color: theme.colors.primary, fontWeight: 'bold' },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'flex-end',
    },
    modalCard: { padding: theme.spacing.md, maxHeight: '72%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
    modalScroll: { marginTop: 10 },
    layerToggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    layerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    legendDot: { width: 14, height: 14, borderWidth: 1.5, borderColor: '#FFFFFF' },
    layerLabel: { fontSize: 13, color: theme.colors.text },
    toggleBadge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    toggleOn: { color: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
    toggleOff: { color: theme.colors.textTertiary, backgroundColor: theme.colors.background },
    previewOverlay: { ...(StyleSheet.absoluteFill as any), justifyContent: 'flex-end', zIndex: 20 },
    previewContainer: { padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
    previewCard: { padding: theme.spacing.md },
    previewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    previewTitleContainer: { flex: 1, marginRight: theme.spacing.md },
    previewTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
    categoryBadge: {
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    categoryBadgeText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary },
    statusBadge: {
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    statusBadgeText: { fontSize: 10, fontWeight: '600', color: theme.colors.textSecondary },
    dateText: { fontSize: 10, color: theme.colors.textTertiary },
    closeButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 16,
    },
    closeIcon: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: 'bold' },
    previewDescription: { marginTop: 6, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19 },
    previewImage: { width: '100%', height: 120, marginTop: 10, borderRadius: 8 },
    placeActionContainer: { marginTop: 10 },
  });

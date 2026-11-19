import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import MiniBarChart from '../components/Charts/MiniBarChart';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getAirQualityRequest } from '../api/environment';
import type { AirQualityData, PollutantKey } from '../types/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'AirQuality'>;

const POLLUTANT_LABELS: Record<PollutantKey, string> = {
  pm25: 'PM2.5',
  pm10: 'PM10',
  no2: 'NO₂',
  so2: 'SO₂',
  co: 'CO',
  o3: 'O₃',
  nh3: 'NH₃',
  pb: 'Pb',
};

export default function AirQualityScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();

  const [aqiData, setAqiData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAqi = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await getAirQualityRequest({
          slug: selectedCity.slug,
          refresh: forceRefresh,
        });
        if (res.success && 'data' in res) {
          setAqiData(res.data);
        } else {
          setError('Unable to load air quality data.');
        }
      } catch {
        setError('Could not connect to air quality service.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCity.slug],
  );

  useEffect(() => {
    loadAqi(false);
  }, [loadAqi]);

  const trendItems =
    aqiData?.hourlyTrend.slice(0, 8).map((p) => {
      const d = new Date(p.time);
      const lbl = Number.isNaN(d.getTime()) ? '' : `${d.getHours()}h`;
      return {
        label: lbl,
        value: p.indicativeAqi,
        color: aqiData.aqiColorHex,
      };
    }) ?? [];

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Air Quality (CPCB NAQI)"
        subtitle={`${selectedCity.name}, ${selectedCity.state}`}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.toolbarRow}>
        <Pressable
          onPress={() => navigation.navigate('CitySelector')}
          style={styles.pillBtn}
        >
          <Text style={styles.pillText}>📍 {selectedCity.name} ▾</Text>
        </Pressable>
        <Pressable
          onPress={() => loadAqi(true)}
          style={styles.pillBtn}
          disabled={refreshing}
        >
          <Text style={styles.pillText}>{refreshing ? '↻ ...' : '↻ Refresh'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.mutedText}>Computing CPCB National AQI...</Text>
        </View>
      ) : error ? (
        <AppCard style={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton label="Retry" onPress={() => loadAqi(true)} />
        </AppCard>
      ) : aqiData ? (
        <>
          <AppCard style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={[styles.typeBadge, { borderColor: aqiData.aqiColorHex }]}>
                <Text style={[styles.typeBadgeText, { color: aqiData.aqiColorHex }]}>
                  {aqiData.isOfficialAqi ? 'OFFICIAL CPCB STATION' : 'MODELED ESTIMATE'}
                </Text>
              </View>
              <Text style={styles.mutedText}>{aqiData.methodology}</Text>
            </View>

            <View style={styles.aqiHero}>
              <View style={[styles.aqiCircle, { borderColor: aqiData.aqiColorHex }]}>
                <Text style={[styles.aqiValue, { color: aqiData.aqiColorHex }]}>
                  {aqiData.overallAqi ?? 'N/A'}
                </Text>
                <Text style={styles.aqiLabel}>NAQI</Text>
              </View>
              <View style={styles.aqiMeta}>
                <Text style={[styles.aqiCategory, { color: aqiData.aqiColorHex }]}>
                  {aqiData.aqiCategory ?? 'Insufficient Data'}
                </Text>
                <Text style={styles.dominantText}>
                  Dominant Pollutant:{' '}
                  {aqiData.dominantPollutant
                    ? POLLUTANT_LABELS[aqiData.dominantPollutant]
                    : 'Unavailable'}
                </Text>
                <Text style={styles.timestampText}>
                  Observed: {new Date(aqiData.observationTimestamp).toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.advisoryTitle}>Health Advisory</Text>
            <Text style={styles.advisoryText}>{aqiData.healthAdvisory}</Text>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.sectionHeader}>DATA SOURCE & RELIABILITY</Text>
            <Text style={styles.bodyText}>{aqiData.provider}</Text>
            <Text style={styles.mutedText}>{aqiData.reliabilityNote}</Text>
            {aqiData.station ? (
              <Text style={styles.stationText}>
                Station: {aqiData.station.stationName}
                {aqiData.station.distanceKm !== null
                  ? ` (${aqiData.station.distanceKm} km away)`
                  : ''}
              </Text>
            ) : null}
          </AppCard>

          <Text style={styles.sectionTitle}>POLLUTANT CONCENTRATIONS & SUB-INDICES</Text>
          <View style={styles.pollutantGrid}>
            {(Object.keys(POLLUTANT_LABELS) as PollutantKey[]).map((key) => {
              const p = aqiData.pollutants[key];
              return (
                <AppCard key={key} style={styles.pollutantTile}>
                  <View style={styles.pollutantTop}>
                    <Text style={styles.pollutantName}>{POLLUTANT_LABELS[key]}</Text>
                    <Text style={styles.pollutantPeriod}>{p.averagingPeriod}</Text>
                  </View>
                  <Text style={styles.pollutantVal}>
                    {p.value !== null ? `${p.value} ${p.unit}` : 'Unavailable'}
                  </Text>
                  <Text style={styles.pollutantSub}>
                    {p.subIndex !== null
                      ? `Sub-Index: ${p.subIndex} (${p.category})`
                      : `Status: ${p.status}`}
                  </Text>
                </AppCard>
              );
            })}
          </View>

          <AppCard style={styles.card}>
            <MiniBarChart
              title="Indicative AQI Trend (24h Window)"
              unit="CPCB Scale"
              items={trendItems}
              emptyMessage="Hourly trend unavailable from active station."
            />
          </AppCard>

          <Text style={styles.attributionText}>{aqiData.attribution}</Text>
        </>
      ) : null}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    toolbarRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    pillBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.round,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    pillText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
    centerBox: { padding: theme.spacing.xl, alignItems: 'center', gap: 12 },
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    errorText: { color: '#EF4444', marginBottom: 12 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    typeBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeBadgeText: { fontSize: 10, fontWeight: 'bold' },
    aqiHero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 14 },
    aqiCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      borderWidth: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    aqiValue: { fontSize: 30, fontWeight: '900' },
    aqiLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: 'bold' },
    aqiMeta: { flex: 1 },
    aqiCategory: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    dominantText: { fontSize: 13, color: theme.colors.text, marginBottom: 4 },
    timestampText: { fontSize: 11, color: theme.colors.textTertiary },
    advisoryTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 4 },
    advisoryText: { fontSize: 13, color: theme.colors.text, lineHeight: 19 },
    sectionHeader: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
    bodyText: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    mutedText: { fontSize: 12, color: theme.colors.textSecondary },
    stationText: { fontSize: 12, color: theme.colors.primary, marginTop: 6 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    pollutantGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    pollutantTile: { width: '48%', padding: theme.spacing.md },
    pollutantTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pollutantName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
    pollutantPeriod: { fontSize: 10, color: theme.colors.textTertiary },
    pollutantVal: { fontSize: 16, fontWeight: '700', color: theme.colors.primary, marginVertical: 4 },
    pollutantSub: { fontSize: 11, color: theme.colors.textSecondary },
    attributionText: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
  });

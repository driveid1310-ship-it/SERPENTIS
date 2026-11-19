import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
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
import { getWeatherRequest } from '../api/environment';
import type { WeatherData } from '../types/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'Weather'>;

function toDisplayTemp(tempC: number, unit: 'C' | 'F'): number {
  return unit === 'F' ? Number(((tempC * 9) / 5 + 32).toFixed(1)) : Number(tempC.toFixed(1));
}

function formatTimeShort(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function WeatherScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity, temperatureUnit, setTemperatureUnit } = useCity();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await getWeatherRequest({
          slug: selectedCity.slug,
          unit: temperatureUnit,
          refresh: forceRefresh,
        });
        if (res.success && 'data' in res) {
          setWeather(res.data);
        } else {
          setError('Unable to load weather data.');
        }
      } catch {
        setError('Could not connect to weather service. Check network and retry.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCity.slug, temperatureUnit],
  );

  useEffect(() => {
    loadWeather(false);
  }, [loadWeather]);

  const hourlyChartItems =
    weather?.hourly24h.slice(0, 8).map((h) => ({
      label: formatTimeShort(h.time).replace(':00', ''),
      value: toDisplayTemp(h.temperatureC, temperatureUnit),
    })) ?? [];

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Weather Intelligence"
        subtitle={`${selectedCity.name}, ${selectedCity.district}, ${selectedCity.state}`}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.toolbarRow}>
        <Pressable
          onPress={() => navigation.navigate('CitySelector')}
          style={styles.pillBtn}
        >
          <Text style={styles.pillText}>📍 {selectedCity.name} ▾</Text>
        </Pressable>

        <View style={styles.toolbarRight}>
          <Pressable
            onPress={() => setTemperatureUnit(temperatureUnit === 'C' ? 'F' : 'C')}
            style={styles.pillBtn}
          >
            <Text style={styles.pillText}>°{temperatureUnit}</Text>
          </Pressable>
          <Pressable
            onPress={() => loadWeather(true)}
            style={styles.pillBtn}
            disabled={refreshing}
          >
            <Text style={styles.pillText}>{refreshing ? '↻ ...' : '↻ Refresh'}</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.mutedText}>Fetching weather observations...</Text>
        </View>
      ) : error ? (
        <AppCard style={styles.card}>
          <Text style={styles.errorText}>{error}</Text>
          <AppButton label="Retry" onPress={() => loadWeather(true)} />
        </AppCard>
      ) : weather ? (
        <>
          {weather.isMockFallback ? (
            <AppCard style={[styles.card, styles.warnCard]}>
              <Text style={styles.warnText}>
                Offline Demo Fallback: Live weather provider unreachable ({weather.unavailableReason || 'network unavailable'}).
              </Text>
            </AppCard>
          ) : null}

          <AppCard style={styles.card}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.eyebrow}>
                  {weather.dataType.toUpperCase()} • {weather.provider}
                </Text>
                <Text style={styles.heroTemp}>
                  {toDisplayTemp(weather.current.temperatureC, temperatureUnit)}°{temperatureUnit}
                </Text>
                <Text style={styles.conditionText}>{weather.current.condition}</Text>
                <Text style={styles.mutedText}>
                  Feels like {toDisplayTemp(weather.current.feelsLikeC, temperatureUnit)}°{temperatureUnit}
                  {weather.current.heatIndexC !== null
                    ? ` • Heat Index ${toDisplayTemp(weather.current.heatIndexC, temperatureUnit)}°${temperatureUnit}`
                    : ''}
                </Text>
              </View>
            </View>

            <Text style={styles.timestampText}>
              Observed: {new Date(weather.observationTimestamp).toLocaleString()}
              {weather.isStale ? ' (Stale)' : ''}
            </Text>
          </AppCard>

          <View style={styles.metricsGrid}>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricVal}>{weather.current.humidityPct}%</Text>
              <Text style={styles.metricSub}>
                Dew Pt {weather.current.dewPointC !== null ? `${toDisplayTemp(weather.current.dewPointC, temperatureUnit)}°` : '—'}
              </Text>
            </AppCard>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricVal}>{weather.current.windSpeedKmh.toFixed(1)} km/h</Text>
              <Text style={styles.metricSub}>
                Gusts {weather.current.windGustsKmh !== null ? `${weather.current.windGustsKmh.toFixed(1)} km/h` : '—'}
              </Text>
            </AppCard>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>Pressure</Text>
              <Text style={styles.metricVal}>
                {weather.current.pressureHpa !== null ? `${Math.round(weather.current.pressureHpa)} hPa` : '—'}
              </Text>
              <Text style={styles.metricSub}>
                Cloud {weather.current.cloudCoverPct !== null ? `${weather.current.cloudCoverPct}%` : '—'}
              </Text>
            </AppCard>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>UV & Visibility</Text>
              <Text style={styles.metricVal}>
                UV {weather.current.uvIndex !== null ? weather.current.uvIndex.toFixed(1) : '—'}
              </Text>
              <Text style={styles.metricSub}>
                Vis {weather.current.visibilityMeters !== null ? `${(weather.current.visibilityMeters / 1000).toFixed(1)} km` : '—'}
              </Text>
            </AppCard>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>Precipitation</Text>
              <Text style={styles.metricVal}>{weather.current.precipitationMm.toFixed(1)} mm</Text>
              <Text style={styles.metricSub}>
                Rain Prob {weather.daily7d[0]?.precipitationProbabilityMaxPct ?? 0}%
              </Text>
            </AppCard>
            <AppCard style={styles.metricTile}>
              <Text style={styles.metricLabel}>Sun & Daylight</Text>
              <Text style={styles.metricVal}>
                {weather.current.daylightDurationHours !== null
                  ? `${weather.current.daylightDurationHours.toFixed(1)} hrs`
                  : '—'}
              </Text>
              <Text style={styles.metricSub}>
                ↑ {formatTimeShort(weather.current.sunrise)} ↓ {formatTimeShort(weather.current.sunset)}
              </Text>
            </AppCard>
          </View>

          <AppCard style={styles.card}>
            <MiniBarChart
              title="Next 24h Temperature Forecast"
              unit={`°${temperatureUnit}`}
              items={hourlyChartItems}
            />
          </AppCard>

          <Text style={styles.sectionTitle}>HOURLY FORECAST (24H)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyStrip}>
            {weather.hourly24h.slice(0, 12).map((h) => (
              <AppCard key={h.time} style={styles.hourlyCard}>
                <Text style={styles.hourlyTime}>{formatTimeShort(h.time)}</Text>
                <Text style={styles.hourlyTemp}>
                  {toDisplayTemp(h.temperatureC, temperatureUnit)}°
                </Text>
                <Text style={styles.hourlyCond} numberOfLines={1}>
                  {h.condition}
                </Text>
                <Text style={styles.hourlyRain}>
                  💧 {h.precipitationProbabilityPct ?? 0}%
                </Text>
              </AppCard>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>7-DAY FORECAST</Text>
          <AppCard style={styles.card}>
            {weather.daily7d.length === 0 ? (
              <Text style={styles.mutedText}>7-day forecast unavailable.</Text>
            ) : (
              weather.daily7d.map((d, idx) => (
                <View
                  key={d.date}
                  style={[
                    styles.dailyRow,
                    idx < weather.daily7d.length - 1 && styles.rowDivider,
                  ]}
                >
                  <View style={styles.dailyLeft}>
                    <Text style={styles.dailyDate}>{d.date}</Text>
                    <Text style={styles.mutedText}>{d.condition}</Text>
                  </View>
                  <View style={styles.dailyRight}>
                    <Text style={styles.dailyRain}>
                      💧 {d.precipitationProbabilityMaxPct ?? 0}% ({(d.precipitationSumMm ?? 0).toFixed(1)} mm)
                    </Text>
                    <Text style={styles.dailyTemps}>
                      {toDisplayTemp(d.tempMinC, temperatureUnit)}° / {toDisplayTemp(d.tempMaxC, temperatureUnit)}°
                    </Text>
                  </View>
                </View>
              ))
            )}
          </AppCard>

          <Text style={styles.attributionText}>{weather.attribution}</Text>
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
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    toolbarRight: { flexDirection: 'row', gap: 8 },
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
    warnCard: { borderColor: '#F59E0B', borderWidth: 1 },
    warnText: { color: '#F59E0B', fontSize: 12 },
    errorText: { color: '#EF4444', marginBottom: 12 },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    eyebrow: { fontSize: 11, color: theme.colors.primary, fontWeight: 'bold', marginBottom: 4 },
    heroTemp: { fontSize: 44, fontWeight: '900', color: theme.colors.text },
    conditionText: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginTop: 2 },
    mutedText: { fontSize: 12, color: theme.colors.textSecondary },
    timestampText: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 10 },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.md,
      justifyContent: 'space-between',
      gap: 8,
      marginBottom: theme.spacing.md,
    },
    metricTile: { width: '48%', padding: theme.spacing.md },
    metricLabel: { fontSize: 11, color: theme.colors.textSecondary, marginBottom: 4 },
    metricVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
    metricSub: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 2 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.xs,
    },
    hourlyStrip: { paddingLeft: theme.spacing.md, marginBottom: theme.spacing.md },
    hourlyCard: { width: 96, padding: theme.spacing.sm, marginRight: 8, alignItems: 'center' },
    hourlyTime: { fontSize: 11, color: theme.colors.textSecondary },
    hourlyTemp: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginVertical: 4 },
    hourlyCond: { fontSize: 10, color: theme.colors.textSecondary },
    hourlyRain: { fontSize: 10, color: theme.colors.primary, marginTop: 4 },
    dailyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    rowDivider: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    dailyLeft: { flex: 1 },
    dailyRight: { alignItems: 'flex-end' },
    dailyDate: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
    dailyRain: { fontSize: 11, color: theme.colors.primary },
    dailyTemps: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginTop: 2 },
    attributionText: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
  });

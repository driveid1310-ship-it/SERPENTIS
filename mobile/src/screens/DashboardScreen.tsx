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
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getCityStatsRequest } from '../api/reports';
import { getUnifiedOverviewRequest } from '../api/environment';
import type { UnifiedOverviewData } from '../types/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity, temperatureUnit } = useCity();

  const [stats, setStats] = useState<any>(null);
  const [overview, setOverview] = useState<UnifiedOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [civicRes, envRes] = await Promise.allSettled([
        getCityStatsRequest(),
        getUnifiedOverviewRequest({
          slug: selectedCity.slug,
          unit: temperatureUnit,
        }),
      ]);

      if (civicRes.status === 'fulfilled' && civicRes.value.success && 'data' in civicRes.value) {
        setStats(civicRes.value.data);
      }
      if (envRes.status === 'fulfilled' && envRes.value.success && 'data' in envRes.value) {
        setOverview(envRes.value.data);
      }
      if (civicRes.status === 'rejected' && envRes.status === 'rejected') {
        setError('Unable to reach server. Check your connection and retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCity.slug, temperatureUnit]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <Screen keyboardAvoiding={false}>
      <Header
        title="Smart City Dashboard"
        subtitle={`${selectedCity.name}, ${selectedCity.district} • Civic & Climate`}
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cityBar}>
          <Pressable
            onPress={() => navigation.navigate('CitySelector')}
            style={styles.cityPill}
          >
            <Text style={styles.cityPillText}>📍 {selectedCity.name}, {selectedCity.state} ▾</Text>
          </Pressable>
          <Pressable onPress={loadDashboard} style={styles.cityPill}>
            <Text style={styles.cityPillText}>↻ Refresh</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {overview ? (
              <>
                <Text style={styles.sectionTitle}>ENVIRONMENTAL & CLIMATE OVERVIEW</Text>
                <View style={styles.grid}>
                  <Pressable style={styles.halfPress} onPress={() => navigation.navigate('Weather')}>
                    <AppCard style={styles.envCard}>
                      <Text style={styles.statLabel}>Weather ({overview.weather.dataType})</Text>
                      <Text style={styles.statValue}>
                        {overview.weather.display.temperature}°{temperatureUnit}
                      </Text>
                      <Text style={styles.envSub} numberOfLines={1}>
                        {overview.weather.current.condition} • RH {overview.weather.current.humidityPct}%
                      </Text>
                    </AppCard>
                  </Pressable>

                  <Pressable style={styles.halfPress} onPress={() => navigation.navigate('AirQuality')}>
                    <AppCard style={styles.envCard}>
                      <Text style={styles.statLabel}>
                        CPCB AQI ({overview.airQuality.isOfficialAqi ? 'Official' : 'Modeled'})
                      </Text>
                      <Text style={[styles.statValue, { color: overview.airQuality.aqiColorHex }]}>
                        {overview.airQuality.overallAqi ?? 'N/A'}
                      </Text>
                      <Text style={styles.envSub} numberOfLines={1}>
                        {overview.airQuality.aqiCategory ?? 'Unavailable'}
                      </Text>
                    </AppCard>
                  </Pressable>

                  <Pressable style={styles.halfPress} onPress={() => navigation.navigate('CityIntelligence')}>
                    <AppCard style={styles.envCard}>
                      <Text style={styles.statLabel}>Env. Health Score</Text>
                      <Text style={styles.statValue}>
                        {overview.scores.environmentalHealth.score ?? 'N/A'}
                        <Text style={styles.outOf}>/100</Text>
                      </Text>
                      <Text style={styles.envSub}>
                        {overview.scores.environmentalHealth.band} • {overview.scores.environmentalHealth.dataCoveragePct}% cov.
                      </Text>
                    </AppCard>
                  </Pressable>

                  <Pressable style={styles.halfPress} onPress={() => navigation.navigate('EnvironmentalAlerts')}>
                    <AppCard style={styles.envCard}>
                      <Text style={styles.statLabel}>Active Climate Alerts</Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: overview.alerts.length > 0 ? '#F97316' : theme.colors.primary },
                        ]}
                      >
                        {overview.alerts.length}
                      </Text>
                      <Text style={styles.envSub} numberOfLines={1}>
                        {overview.alerts[0]?.title ?? 'No active advisories'}
                      </Text>
                    </AppCard>
                  </Pressable>
                </View>

                <View style={styles.quickNavRow}>
                  <Pressable onPress={() => navigation.navigate('EnvironmentalAnalytics')} style={styles.quickNavBtn}>
                    <Text style={styles.quickNavText}>📈 Analytics</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('CityAssistant')} style={styles.quickNavBtn}>
                    <Text style={styles.quickNavText}>🤖 AI Assistant</Text>
                  </Pressable>
                  <Pressable onPress={() => navigation.navigate('EnvironmentalMonitoring')} style={styles.quickNavBtn}>
                    <Text style={styles.quickNavText}>🔬 Monitoring</Text>
                  </Pressable>
                </View>
              </>
            ) : null}

            {stats ? (
              <>
                <Text style={styles.sectionTitle}>CIVIC INTELLIGENCE OVERVIEW</Text>
                <View style={styles.grid}>
                  <AppCard style={styles.statCard}>
                    <Text style={styles.statLabel}>Total Reports</Text>
                    <Text style={styles.statValue}>{stats.totalReports}</Text>
                  </AppCard>
                  <AppCard style={styles.statCard}>
                    <Text style={styles.statLabel}>Pending</Text>
                    <Text style={styles.statValue}>{stats.pending}</Text>
                  </AppCard>
                  <AppCard style={styles.statCard}>
                    <Text style={styles.statLabel}>In Progress</Text>
                    <Text style={[styles.statValue, { color: theme.colors.warning }]}>
                      {stats.inProgress}
                    </Text>
                  </AppCard>
                  <AppCard style={styles.statCard}>
                    <Text style={styles.statLabel}>Resolved</Text>
                    <Text style={[styles.statValue, { color: theme.colors.success }]}>
                      {stats.resolved}
                    </Text>
                  </AppCard>
                  <AppCard style={[styles.statCard, styles.fullWidthCard]}>
                    <Text style={styles.statLabel}>Verified by Moderator</Text>
                    <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                      {stats.verified}
                    </Text>
                  </AppCard>
                </View>

                <Text style={styles.sectionTitle}>REPORTS BY CATEGORY</Text>
                <AppCard style={styles.categoryCard}>
                  {stats.byCategory && stats.byCategory.length > 0 ? (
                    stats.byCategory.map((cat: any, index: number) => (
                      <View
                        key={cat.category}
                        style={[
                          styles.categoryRow,
                          index < stats.byCategory.length - 1 && styles.borderBottom,
                        ]}
                      >
                        <Text style={styles.categoryName}>{cat.category}</Text>
                        <Text style={styles.categoryCount}>{cat.count}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyCategory}>No reports available.</Text>
                  )}
                </AppCard>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    content: { padding: theme.spacing.md },
    cityBar: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing.md },
    cityPill: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.round,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cityPillText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
    loader: { marginTop: theme.spacing.xxl },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    halfPress: { width: '48%', marginBottom: theme.spacing.md },
    envCard: { padding: theme.spacing.md, alignItems: 'center' },
    envSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4, textAlign: 'center' },
    outOf: { fontSize: 13, color: theme.colors.textTertiary },
    quickNavRow: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
    quickNavBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    quickNavText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
    fullWidthCard: { width: '100%' },
    statCard: {
      width: '48%',
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabel: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    statValue: { fontSize: theme.typography.h2, fontWeight: 'bold', color: theme.colors.text },
    errorText: { textAlign: 'center', color: '#EF4444', marginTop: theme.spacing.xl },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.xs,
      fontWeight: 'bold',
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.xs,
    },
    categoryCard: { padding: theme.spacing.md, marginBottom: theme.spacing.xxl },
    categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.md },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    categoryName: { fontSize: theme.typography.fontSizes.md, color: theme.colors.text, textTransform: 'capitalize' },
    categoryCount: { fontSize: theme.typography.fontSizes.md, fontWeight: 'bold', color: theme.colors.text },
    emptyCategory: { textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: theme.spacing.md },
  });

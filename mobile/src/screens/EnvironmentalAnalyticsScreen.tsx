import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import MiniBarChart from '../components/Charts/MiniBarChart';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getAnalyticsRequest } from '../api/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'EnvironmentalAnalytics'>;

export default function EnvironmentalAnalyticsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();

  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsRequest({ slug: selectedCity.slug, days: 14 });
      if (res.success && 'data' in res) {
        setAnalytics(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [selectedCity.slug]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const tempItems =
    analytics?.weatherAnalytics?.dailyTrends?.slice(-7).map((d: any) => ({
      label: String(d.date).slice(5),
      value: d.tempAvgC ?? null,
    })) ?? [];

  const aqiItems =
    analytics?.aqiAnalytics?.dailyTrends?.slice(-7).map((d: any) => ({
      label: String(d.date).slice(5),
      value: d.aqiAvg ?? null,
      color: '#F97316',
    })) ?? [];

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Climate & Civic Analytics"
        subtitle={`${selectedCity.name} • 14-Day Window`}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : analytics ? (
        <>
          <AppCard style={styles.card}>
            <Text style={styles.noticeTitle}>DATA COVERAGE TRANSPARENCY</Text>
            <Text style={styles.mutedText}>{analytics.coverageNotice}</Text>
          </AppCard>

          <AppCard style={styles.card}>
            <MiniBarChart
              title="Daily Average Temperature"
              unit="°C"
              items={tempItems}
              emptyMessage="Historical weather snapshots will appear here as observations accumulate."
            />
          </AppCard>

          <AppCard style={styles.card}>
            <MiniBarChart
              title="Daily Average AQI"
              unit="CPCB Scale"
              items={aqiItems}
              emptyMessage="Historical AQI snapshots will appear here as observations accumulate."
            />
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>CIVIC RESOLUTION ANALYTICS</Text>
            <View style={styles.gridRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Total Reports</Text>
                <Text style={styles.statVal}>{analytics.civicAnalytics.totalReports}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Resolution Rate</Text>
                <Text style={styles.statVal}>{analytics.civicAnalytics.resolutionRatePct}%</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Avg Resolution</Text>
                <Text style={styles.statVal}>
                  {analytics.civicAnalytics.avgResolutionHours !== null
                    ? `${analytics.civicAnalytics.avgResolutionHours}h`
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.sectionTitle}>ENVIRONMENTAL HOTSPOT CATEGORIES</Text>
            {analytics.environmentalAnalytics.hotspotCategories.length === 0 ? (
              <Text style={styles.mutedText}>No environmental hotspot reports in this period.</Text>
            ) : (
              analytics.environmentalAnalytics.hotspotCategories.map((h: any) => (
                <View key={h.category} style={styles.catRow}>
                  <Text style={styles.catName}>{h.category}</Text>
                  <Text style={styles.catCount}>
                    {h.count} ({h.unresolved} open)
                  </Text>
                </View>
              ))
            )}
          </AppCard>
        </>
      ) : (
        <AppCard style={styles.card}>
          <Text style={styles.mutedText}>Failed to load analytics.</Text>
        </AppCard>
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    loader: { marginTop: theme.spacing.xxl },
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    noticeTitle: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
    mutedText: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 10 },
    gridRow: { flexDirection: 'row', gap: 8 },
    statBox: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statLabel: { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
    statVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginTop: 4 },
    catRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    catName: { fontSize: 13, color: theme.colors.text, textTransform: 'capitalize' },
    catCount: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary },
  });

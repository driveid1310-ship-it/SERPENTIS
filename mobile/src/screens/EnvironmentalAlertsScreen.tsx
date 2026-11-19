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
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getAlertHistoryRequest, getAlertsRequest } from '../api/environment';
import type { EnvironmentalAlertItem } from '../types/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'EnvironmentalAlerts'>;

const SEVERITY_COLOR: Record<string, string> = {
  extreme: '#EF4444',
  severe: '#F97316',
  moderate: '#EAB308',
  advisory: '#00F0FF',
};

export default function EnvironmentalAlertsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [activeAlerts, setActiveAlerts] = useState<EnvironmentalAlertItem[]>([]);
  const [historyAlerts, setHistoryAlerts] = useState<EnvironmentalAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, histRes] = await Promise.all([
        getAlertsRequest({ slug: selectedCity.slug }),
        getAlertHistoryRequest({ slug: selectedCity.slug, limit: 30 }),
      ]);
      if (activeRes.success && 'data' in activeRes) {
        setActiveAlerts(activeRes.data.activeAlerts);
      }
      if (histRes.success && 'data' in histRes) {
        setHistoryAlerts(histRes.data.alerts);
      }
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  }, [selectedCity.slug]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const list = tab === 'active' ? activeAlerts : historyAlerts;

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Climate & Risk Alerts"
        subtitle={`${selectedCity.name}, ${selectedCity.state}`}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setTab('active')}
          style={[styles.tabBtn, tab === 'active' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            Active ({activeAlerts.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('history')}
          style={[styles.tabBtn, tab === 'history' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            History ({historyAlerts.length})
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : list.length === 0 ? (
        <AppCard style={styles.card}>
          <Text style={styles.emptyTitle}>
            {tab === 'active' ? 'No Active Environmental Alerts' : 'No Historical Alerts Recorded'}
          </Text>
          <Text style={styles.mutedText}>
            Current weather, AQI, and waterlogging levels for {selectedCity.name} are below alert thresholds.
          </Text>
          <AppButton label="Refresh Alerts" onPress={loadAlerts} variant="outline" />
        </AppCard>
      ) : (
        list.map((alert) => {
          const color = SEVERITY_COLOR[alert.severity] || theme.colors.primary;
          return (
            <AppCard key={alert._id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: color }]}>
              <View style={styles.badgeRow}>
                <Text style={[styles.sevText, { color }]}>
                  {alert.severity.toUpperCase()} • {alert.category.toUpperCase()}
                </Text>
                <Text style={styles.verifText}>
                  {alert.verificationStatus === 'official' ? 'OFFICIAL' : 'THRESHOLD ADVISORY'}
                </Text>
              </View>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDesc}>{alert.description}</Text>

              {alert.precautions?.length > 0 ? (
                <View style={styles.precautionsBox}>
                  <Text style={styles.precTitle}>Recommended Precautions:</Text>
                  {alert.precautions.map((p, i) => (
                    <Text key={i} style={styles.precItem}>• {p}</Text>
                  ))}
                </View>
              ) : null}

              <Text style={styles.metaText}>
                Source: {alert.source} • Expires: {new Date(alert.expiresAt).toLocaleString()}
              </Text>
            </AppCard>
          );
        })
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    tabRow: { flexDirection: 'row', paddingHorizontal: theme.spacing.md, gap: 8, marginBottom: theme.spacing.md },
    tabBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabBtnActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
    tabText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
    tabTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
    loader: { marginTop: theme.spacing.xxl },
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    emptyTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6 },
    mutedText: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
    badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    sevText: { fontSize: 11, fontWeight: 'bold' },
    verifText: { fontSize: 10, color: theme.colors.textTertiary, fontWeight: 'bold' },
    alertTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6 },
    alertDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 19, marginBottom: 8 },
    precautionsBox: {
      backgroundColor: theme.colors.background,
      padding: 10,
      borderRadius: 8,
      marginBottom: 8,
    },
    precTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
    precItem: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 },
    metaText: { fontSize: 11, color: theme.colors.textTertiary },
  });

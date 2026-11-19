import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { useLocation } from '../hooks/useLocation';
import {
  getMonitoringOverviewRequest,
  submitEnvironmentalReadingRequest,
} from '../api/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'EnvironmentalMonitoring'>;

export default function EnvironmentalMonitoringScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();
  const { location } = useLocation();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<'noise-db' | 'water-ph' | 'water-tds'>('noise-db');
  const [valueInput, setValueInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMonitoringOverviewRequest({ slug: selectedCity.slug });
      if (res.success && 'data' in res) {
        setData(res.data);
      }
    } catch {
      // handled in UI
    } finally {
      setLoading(false);
    }
  }, [selectedCity.slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmitReading = async () => {
    const val = Number(valueInput);
    if (!Number.isFinite(val)) {
      Alert.alert('Invalid Value', 'Please enter a valid numeric reading.');
      return;
    }
    setSubmitting(true);
    try {
      const lat = location?.coordinates[1] ?? selectedCity.latitude;
      const lon = location?.coordinates[0] ?? selectedCity.longitude;
      const res = await submitEnvironmentalReadingRequest({
        metricName: metric,
        numericValue: val,
        latitude: lat,
        longitude: lon,
        citySlug: selectedCity.slug,
        notes: notesInput.trim() || undefined,
      });
      if (res.success) {
        Alert.alert('Recorded', 'Citizen environmental estimate saved.');
        setValueInput('');
        setNotesInput('');
        loadData();
      }
    } catch (err: any) {
      Alert.alert('Unable to Record', err?.response?.data?.message || 'Sign in and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scrollable keyboardAvoiding>
      <Header
        title="Environmental Monitoring"
        subtitle={`Noise, Water, Green Cover & Waste • ${selectedCity.name}`}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : data ? (
        <>
          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>🔊 Noise Pollution</Text>
            <Text style={styles.mutedText}>{data.noise.dataNote}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Calibrated Sensors</Text>
                <Text style={styles.statValue}>
                  {data.noise.avgCalibratedDb !== null ? `${data.noise.avgCalibratedDb} dBA` : 'None'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Citizen Estimates ({data.noise.citizenEstimateCount})</Text>
                <Text style={styles.statValue}>
                  {data.noise.avgCitizenEstimateDb !== null ? `${data.noise.avgCitizenEstimateDb} dBA` : 'None'}
                </Text>
              </View>
            </View>
            <Text style={styles.subMeta}>Noise Complaints Logged: {data.noise.noiseComplaintsCount}</Text>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>💧 Water Quality & Contamination</Text>
            <Text style={styles.mutedText}>{data.waterQuality.dataNote}</Text>
            <Text style={styles.bodyLine}>
              Field Readings Logged: {data.waterQuality.readingsCount} • Suspected Contamination Reports: {data.waterQuality.suspectedContaminationReportsCount}
            </Text>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>🌳 Green Cover & Parks</Text>
            <Text style={styles.bodyLine}>
              Mapped Parks, Lakes & Green Spaces: {data.greenCover.spacesCount}
            </Text>
            {data.greenCover.spaces.slice(0, 4).map((g: any) => (
              <Text key={g._id} style={styles.listItem}>• {g.name} ({g.category})</Text>
            ))}
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>🗑️ Waste & Waterlogging Hotspots</Text>
            <Text style={styles.bodyLine}>
              Waste Reports: {data.wasteMonitoring.totalReports} (Unresolved: {data.wasteMonitoring.unresolvedHotspots}, Cleaned: {data.wasteMonitoring.cleanupResolvedCount})
            </Text>
            <Text style={styles.bodyLine}>
              Waterlogging / Drainage Reports: {data.waterlogging.reportsCount}
            </Text>
          </AppCard>

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>Log Citizen Observation (Uncalibrated)</Text>
            <View style={styles.pillRow}>
              {(
                [
                  { key: 'noise-db', label: 'Noise (dBA)' },
                  { key: 'water-ph', label: 'Water pH' },
                  { key: 'water-tds', label: 'Water TDS (ppm)' },
                ] as const
              ).map((m) => (
                <Pressable
                  key={m.key}
                  onPress={() => setMetric(m.key)}
                  style={[styles.pill, metric === m.key && styles.pillActive]}
                >
                  <Text style={[styles.pillText, metric === m.key && styles.pillTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <AppInput
              placeholder={metric === 'noise-db' ? 'e.g. 78' : metric === 'water-ph' ? 'e.g. 7.1' : 'e.g. 240'}
              value={valueInput}
              onChangeText={setValueInput}
              keyboardType="numeric"
            />
            <View style={styles.spacer} />
            <AppInput
              placeholder="Location / observation note (optional)"
              value={notesInput}
              onChangeText={setNotesInput}
            />
            <View style={styles.spacer} />
            <AppButton
              label="Submit Citizen Observation"
              onPress={handleSubmitReading}
              loading={submitting}
            />
          </AppCard>
        </>
      ) : (
        <AppCard style={styles.card}>
          <Text style={styles.mutedText}>Could not load monitoring overview.</Text>
          <AppButton label="Retry" onPress={loadData} />
        </AppCard>
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    loader: { marginTop: theme.spacing.xxl },
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6 },
    mutedText: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 8 },
    statsRow: { flexDirection: 'row', gap: 10, marginVertical: 6 },
    statBox: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statLabel: { fontSize: 11, color: theme.colors.textSecondary },
    statValue: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginTop: 2 },
    subMeta: { fontSize: 12, color: theme.colors.textTertiary, marginTop: 4 },
    bodyLine: { fontSize: 13, color: theme.colors.text, marginBottom: 4 },
    listItem: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    pillRow: { flexDirection: 'row', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    pillActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
    pillText: { fontSize: 12, color: theme.colors.textSecondary },
    pillTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
    spacer: { height: 10 },
  });

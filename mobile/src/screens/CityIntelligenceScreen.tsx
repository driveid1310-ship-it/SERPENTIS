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
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import {
  estimateCarbonFootprintRequest,
  getScoresRequest,
  getSmartCityCapabilitiesRequest,
} from '../api/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'CityIntelligence'>;

export default function CityIntelligenceScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity } = useCity();

  const [scores, setScores] = useState<any>(null);
  const [smartCity, setSmartCity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [carKm, setCarKm] = useState('30');
  const [kwhMonth, setKwhMonth] = useState('180');
  const [carbonResult, setCarbonResult] = useState<any>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [scRes, capRes] = await Promise.all([
        getScoresRequest({ slug: selectedCity.slug }),
        getSmartCityCapabilitiesRequest({ slug: selectedCity.slug }),
      ]);
      if (scRes.success && 'data' in scRes) setScores(scRes.data);
      if (capRes.success && 'data' in capRes) setSmartCity(capRes.data);
    } catch {
      // handled below
    } finally {
      setLoading(false);
    }
  }, [selectedCity.slug]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCalculateCarbon = async () => {
    try {
      const res = await estimateCarbonFootprintRequest({
        carKmPerWeek: Number(carKm) || 0,
        monthlyElectricityKwh: Number(kwhMonth) || 0,
      });
      if (res.success && 'data' in res) setCarbonResult(res.data);
    } catch {
      // ignore
    }
  };

  return (
    <Screen scrollable keyboardAvoiding>
      <Header
        title="City Intelligence & Smart Hub"
        subtitle={`${selectedCity.name}, ${selectedCity.state}`}
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <>
          {scores ? (
            <>
              <AppCard style={styles.card}>
                <Text style={styles.eyebrow}>SERPENTIS SIGNATURE SCORES</Text>
                <View style={styles.scorePair}>
                  <View style={styles.scoreTile}>
                    <Text style={styles.scoreLabel}>Environmental Health</Text>
                    <Text style={styles.scoreNum}>
                      {scores.environmentalHealth.score ?? 'N/A'}
                      <Text style={styles.scoreOutOf}>/100</Text>
                    </Text>
                    <Text style={styles.bandText}>{scores.environmentalHealth.band}</Text>
                    <Text style={styles.covText}>
                      Coverage: {scores.environmentalHealth.dataCoveragePct}%
                    </Text>
                  </View>
                  <View style={styles.scoreTile}>
                    <Text style={styles.scoreLabel}>Civic Health</Text>
                    <Text style={styles.scoreNum}>
                      {scores.civicHealth.score ?? 'N/A'}
                      <Text style={styles.scoreOutOf}>/100</Text>
                    </Text>
                    <Text style={styles.bandText}>
                      {scores.civicHealth.metrics.resolutionRatePct ?? 0}% Resolved
                    </Text>
                    <Text style={styles.covText}>
                      Services: {scores.civicHealth.metrics.nearbyPublicServicesMapped}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subHeading}>Methodology & Component Weights</Text>
                {scores.environmentalHealth.components.map((c: any) => (
                  <View key={c.indicator} style={styles.compRow}>
                    <View style={styles.compLeft}>
                      <Text style={styles.compName}>
                        {c.indicator} ({c.weightPct}%)
                      </Text>
                      <Text style={styles.mutedText}>{c.rawValue}</Text>
                    </View>
                    <Text style={styles.compScore}>
                      {c.subScore !== null ? `${c.subScore}/100` : '—'}
                    </Text>
                  </View>
                ))}
                <Text style={styles.disclaimerText}>
                  {scores.environmentalHealth.disclaimer}
                </Text>
              </AppCard>
            </>
          ) : null}

          {smartCity ? (
            <>
              <AppCard style={styles.card}>
                <Text style={styles.cardTitle}>☀️ Solar Potential</Text>
                <Text style={styles.bodyText}>
                  Current Rating: {smartCity.solarPotential.currentRating} • Shortwave Radiation:{' '}
                  {smartCity.solarPotential.currentSolarRadiationWm2 ?? 'N/A'} W/m²
                </Text>
                <Text style={styles.mutedText}>{smartCity.solarPotential.note}</Text>
              </AppCard>

              <AppCard style={styles.card}>
                <Text style={styles.cardTitle}>🚨 Disaster Preparedness (India Helplines)</Text>
                <View style={styles.helplineGrid}>
                  {smartCity.disasterPreparedness.nationalEmergencyContacts.map((c: any) => (
                    <View key={c.number} style={styles.helplineChip}>
                      <Text style={styles.helplineNum}>{c.number}</Text>
                      <Text style={styles.helplineLbl}>{c.label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.subHeading}>
                  Nearby Mapped Hospitals: {smartCity.disasterPreparedness.nearbyEmergencyServices.hospitals.length}
                </Text>
              </AppCard>

              <AppCard style={styles.card}>
                <Text style={styles.cardTitle}>🚆 Sustainable Mobility & Green Spaces</Text>
                <Text style={styles.bodyText}>
                  Transit Stops Mapped: {smartCity.mobilityAndGreen.transitStops.length} • Parks & Green Spaces: {smartCity.mobilityAndGreen.greenSpaces.length}
                </Text>
                <Text style={styles.mutedText}>{smartCity.mobilityAndGreen.dataNote}</Text>
              </AppCard>

              <AppCard style={styles.card}>
                <Text style={styles.cardTitle}>🌱 Citizen Environmental Challenges</Text>
                {smartCity.challenges.challenges.map((ch: any) => (
                  <View key={ch.id} style={styles.challengeItem}>
                    <Text style={styles.challengeTitle}>
                      {ch.title} (+{ch.rewardPoints} pts)
                    </Text>
                    <Text style={styles.mutedText}>{ch.description}</Text>
                  </View>
                ))}
              </AppCard>
            </>
          ) : null}

          <AppCard style={styles.card}>
            <Text style={styles.cardTitle}>🌍 Educational Carbon Footprint Estimator</Text>
            <Text style={styles.mutedText}>Weekly Car Travel (km/week)</Text>
            <AppInput value={carKm} onChangeText={setCarKm} keyboardType="numeric" />
            <View style={styles.spacer} />
            <Text style={styles.mutedText}>Monthly Electricity Usage (kWh/month)</Text>
            <AppInput value={kwhMonth} onChangeText={setKwhMonth} keyboardType="numeric" />
            <View style={styles.spacer} />
            <AppButton label="Estimate Footprint" onPress={handleCalculateCarbon} />
            {carbonResult ? (
              <View style={styles.carbonOut}>
                <Text style={styles.carbonVal}>
                  {carbonResult.totalTonnesPerYear} tonnes CO₂ / year ({carbonResult.totalKgCo2PerYear} kg)
                </Text>
                <Text style={styles.mutedText}>{carbonResult.recommendations[0]}</Text>
                <Text style={styles.disclaimerText}>{carbonResult.assumptionsDisclaimer}</Text>
              </View>
            ) : null}
          </AppCard>
        </>
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    loader: { marginTop: theme.spacing.xxl },
    card: { marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md, padding: theme.spacing.md },
    eyebrow: { fontSize: 11, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 6 },
    scorePair: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    scoreTile: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    scoreLabel: { fontSize: 11, color: theme.colors.textSecondary, textAlign: 'center' },
    scoreNum: { fontSize: 28, fontWeight: '900', color: theme.colors.primary, marginVertical: 4 },
    scoreOutOf: { fontSize: 12, color: theme.colors.textTertiary },
    bandText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.text },
    covText: { fontSize: 10, color: theme.colors.textTertiary, marginTop: 2 },
    subHeading: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginTop: 6, marginBottom: 6 },
    compRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    compLeft: { flex: 1 },
    compName: { fontSize: 12, fontWeight: '600', color: theme.colors.text },
    compScore: { fontSize: 13, fontWeight: 'bold', color: theme.colors.primary },
    bodyText: { fontSize: 13, color: theme.colors.text, marginBottom: 4 },
    mutedText: { fontSize: 12, color: theme.colors.textSecondary },
    disclaimerText: { fontSize: 10, color: theme.colors.textTertiary, marginTop: 10, lineHeight: 15 },
    helplineGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 6 },
    helplineChip: {
      width: '48%',
      backgroundColor: theme.colors.background,
      padding: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    helplineNum: { fontSize: 16, fontWeight: '900', color: theme.colors.primary },
    helplineLbl: { fontSize: 11, color: theme.colors.textSecondary },
    challengeItem: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    challengeTitle: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text },
    spacer: { height: 8 },
    carbonOut: { marginTop: 12, padding: 10, backgroundColor: theme.colors.background, borderRadius: 8 },
    carbonVal: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 4 },
  });

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
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { listLocationsRequest } from '../api/environment';
import type { CityCatalogItem } from '../types/environment';

type Props = NativeStackScreenProps<RootStackParamList, 'CitySelector'>;

export default function CitySelectorScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity, setSelectedCity } = useCity();

  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<'all' | 'pilot' | 'state' | 'national'>('all');
  const [cities, setCities] = useState<CityCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listLocationsRequest({
        stage: stage === 'all' ? undefined : stage,
        q: query.trim() || undefined,
      });
      if (res.success && 'data' in res) {
        setCities(res.data.cities);
      }
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, [query, stage]);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const handleSelect = async (item: CityCatalogItem) => {
    await setSelectedCity({
      slug: item.slug,
      name: item.name,
      city: item.city,
      district: item.district,
      state: item.state,
      locality: item.locality,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    navigation.goBack();
  };

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Select City / Region"
        subtitle="India → State → District → City → Locality"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.searchWrap}>
        <AppInput
          placeholder="Search city, district, state (e.g. Badlapur, Thane, Pune)"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.tabsRow}>
        {(['all', 'pilot', 'state', 'national'] as const).map((s) => (
          <Pressable
            key={s}
            onPress={() => setStage(s)}
            style={[styles.tabPill, stage === s && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, stage === s && styles.tabTextActive]}>
              {s === 'all'
                ? 'All India'
                : s === 'pilot'
                  ? 'Badlapur Pilot'
                  : s === 'state'
                    ? 'Maharashtra'
                    : 'Pan-India'}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
      ) : (
        <View style={styles.listWrap}>
          {cities.map((c) => {
            const isSelected = c.slug === selectedCity.slug;
            return (
              <Pressable key={c.slug} onPress={() => handleSelect(c)}>
                <AppCard style={[styles.cityCard, isSelected && styles.cityCardSelected]}>
                  <View style={styles.cityHeader}>
                    <View>
                      <Text style={styles.cityName}>{c.name}</Text>
                      <Text style={styles.cityHierarchy}>
                        {c.locality} • {c.district} Dist., {c.state}
                      </Text>
                    </View>
                    <View style={styles.stageBadge}>
                      <Text style={styles.stageText}>{c.expansionStage.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.coverageText}>
                    Coverage: Weather ✓ • Modeled AQI ✓ • Stations{' '}
                    {c.coverage.airQualityStations ? '✓' : 'Modeled Fallback'}
                  </Text>
                </AppCard>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    searchWrap: { paddingHorizontal: theme.spacing.md, marginBottom: theme.spacing.sm },
    tabsRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      gap: 6,
      marginBottom: theme.spacing.md,
      flexWrap: 'wrap',
    },
    tabPill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radius.round,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabPillActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
    tabText: { fontSize: 12, color: theme.colors.textSecondary },
    tabTextActive: { color: theme.colors.primary, fontWeight: 'bold' },
    loader: { marginTop: theme.spacing.xl },
    listWrap: { paddingHorizontal: theme.spacing.md, gap: 10, paddingBottom: theme.spacing.xxl },
    cityCard: { padding: theme.spacing.md },
    cityCardSelected: { borderWidth: 2, borderColor: theme.colors.primary },
    cityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cityName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
    cityHierarchy: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    stageBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: theme.colors.primarySoft,
    },
    stageText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary },
    coverageText: { fontSize: 11, color: theme.colors.textTertiary, marginTop: 8 },
  });

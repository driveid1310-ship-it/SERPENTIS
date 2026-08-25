import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { theme } from '../theme';

type PlacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Places'
>;

interface PlacesScreenProps {
  navigation: PlacesScreenNavigationProp;
}

type PlaceCategory =
  | 'hospital'
  | 'police'
  | 'fire-station'
  | 'government-office'
  | 'water-supply'
  | 'electricity-office'
  | 'waste-management'
  | 'other';

interface PlaceCategoryOption {
  key: PlaceCategory;
  label: string;
}

const PLACE_CATEGORY_OPTIONS: PlaceCategoryOption[] = [
  { key: 'hospital', label: 'Hospital' },
  { key: 'police', label: 'Police' },
  { key: 'fire-station', label: 'Fire Station' },
  { key: 'government-office', label: 'Govt. Office' },
  { key: 'water-supply', label: 'Water Supply' },
  { key: 'electricity-office', label: 'Electricity' },
  { key: 'waste-management', label: 'Waste Mgmt.' },
  { key: 'other', label: 'Other' },
];

interface StaticPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  distanceLabel: string;
  address: string;
}

// Local placeholder content only — mirrors the same convention already
// used by HomeScreen's nearbyIssues/trendingIssues (static sample data,
// not a live API result). There is no places backend to call yet, and
// per this sprint's rules real GPS/distance is not calculated — the
// "distance" shown here is illustrative sample text, not a measurement.
const SAMPLE_PLACES: StaticPlace[] = [
  {
    id: 'sample-1',
    name: 'City General Hospital',
    category: 'hospital',
    distanceLabel: 'Sample data — distance unavailable',
    address: '4th Cross Street, Central District',
  },
  {
    id: 'sample-2',
    name: 'Central Police Station',
    category: 'police',
    distanceLabel: 'Sample data — distance unavailable',
    address: 'Market Road, Central District',
  },
  {
    id: 'sample-3',
    name: 'Municipal Water Works Office',
    category: 'water-supply',
    distanceLabel: 'Sample data — distance unavailable',
    address: 'Civic Centre, Sector 7',
  },
  {
    id: 'sample-4',
    name: 'District Fire Station',
    category: 'fire-station',
    distanceLabel: 'Sample data — distance unavailable',
    address: 'Highway Road, Sector 3',
  },
];

const CATEGORY_LABEL_BY_KEY: Record<PlaceCategory, string> =
  PLACE_CATEGORY_OPTIONS.reduce(
    (accumulator, option) => {
      accumulator[option.key] = option.label;
      return accumulator;
    },
    {} as Record<PlaceCategory, string>,
  );

export default function PlacesScreen({ navigation }: PlacesScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategory | null>(null);
  const [locationNoticeVisible, setLocationNoticeVisible] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCategoryPress = useCallback((key: PlaceCategory) => {
    setSelectedCategory((previous) => (previous === key ? null : key));
  }, []);

  const handleUseCurrentLocationPress = useCallback(() => {
    setLocationNoticeVisible(true);
  }, []);

  const filteredPlaces = selectedCategory
    ? SAMPLE_PLACES.filter((place) => place.category === selectedCategory)
    : SAMPLE_PLACES;

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Places"
        subtitle="Find nearby hospitals, offices and public services."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <AppCard elevation="sm">
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.locationPlaceholder}>
              Showing sample places — location not attached
            </Text>
          </View>
          <Text style={styles.noticeText}>
            Location services will be connected in a future update.
          </Text>
          {locationNoticeVisible ? (
            <Text style={styles.noticeTextConfirm}>
              GPS is not connected yet — results below are sample data, not
              places near you.
            </Text>
          ) : null}
          <AppButton
            label="Use Current Location"
            onPress={handleUseCurrentLocationPress}
            variant="outline"
          />
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter by Category</Text>
        <View style={styles.categoryGrid}>
          {PLACE_CATEGORY_OPTIONS.map((category) => {
            const isSelected = selectedCategory === category.key;
            return (
              <View key={category.key} style={styles.categoryItem}>
                <Pressable
                  onPress={() => handleCategoryPress(category.key)}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory
              ? `${CATEGORY_LABEL_BY_KEY[selectedCategory]} Nearby`
              : 'Nearby Places'}
          </Text>
          {selectedCategory ? (
            <Pressable onPress={() => setSelectedCategory(null)} hitSlop={8}>
              <Text style={styles.clearFilterText}>Clear filter</Text>
            </Pressable>
          ) : null}
        </View>

        {filteredPlaces.length === 0 ? (
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No sample places in this category yet.
            </Text>
          </AppCard>
        ) : (
          filteredPlaces.map((place) => (
            <AppCard key={place.id} elevation="sm" style={styles.placeCard}>
              <View style={styles.placeCardHeader}>
                <Text style={styles.placeName} numberOfLines={1}>
                  {place.name}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORY_LABEL_BY_KEY[place.category]}
                  </Text>
                </View>
              </View>
              <Text style={styles.placeAddress}>{place.address}</Text>
              <Text style={styles.placeDistance}>{place.distanceLabel}</Text>
            </AppCard>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  noticeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  noticeTextConfirm: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.warning,
    marginBottom: theme.spacing.md,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  locationPlaceholder: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  categoryItem: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  categoryChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.primaryLight,
  },
  categoryChipText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: theme.colors.accent,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearFilterText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  placeCard: {
    marginBottom: theme.spacing.sm,
  },
  placeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  placeName: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  placeAddress: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  placeDistance: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
  },
});

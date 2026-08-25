import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { theme } from '../theme';

type HeritageScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Heritage'
>;

interface HeritageScreenProps {
  navigation: HeritageScreenNavigationProp;
}

type HeritageCategory = 'monument' | 'temple' | 'museum' | 'historic-site';

interface HeritageCategoryOption {
  key: HeritageCategory;
  label: string;
}

const HERITAGE_CATEGORY_OPTIONS: HeritageCategoryOption[] = [
  { key: 'monument', label: 'Monument' },
  { key: 'temple', label: 'Temple' },
  { key: 'museum', label: 'Museum' },
  { key: 'historic-site', label: 'Historic Site' },
];

interface HeritageSpot {
  id: string;
  name: string;
  category: HeritageCategory;
  era: string;
  description: string;
}

// Local placeholder content — same "sample data" convention used across
// Home/Places/Notifications (static illustrative items, not a live API
// result). There is no heritage backend or data source yet.
const SAMPLE_HERITAGE_SPOTS: HeritageSpot[] = [
  {
    id: 'sample-1',
    name: 'Old Clock Tower',
    category: 'monument',
    era: 'Sample data — 19th century',
    description:
      'A landmark clock tower at the heart of the old town, known for its hand-wound mechanism.',
  },
  {
    id: 'sample-2',
    name: 'Riverside Heritage Temple',
    category: 'temple',
    era: 'Sample data — 17th century',
    description:
      'A centuries-old temple complex known for its carved stone pillars and annual festival.',
  },
  {
    id: 'sample-3',
    name: 'City Heritage Museum',
    category: 'museum',
    era: 'Sample data — Founded 1932',
    description:
      'Houses artifacts, photographs and records tracing the city\u2019s civic history.',
  },
  {
    id: 'sample-4',
    name: 'Old Fort Ruins',
    category: 'historic-site',
    era: 'Sample data — Medieval period',
    description:
      'Remnants of a fortification wall, now a protected historic site open to visitors.',
  },
];

const CATEGORY_LABEL_BY_KEY: Record<HeritageCategory, string> =
  HERITAGE_CATEGORY_OPTIONS.reduce(
    (accumulator, option) => {
      accumulator[option.key] = option.label;
      return accumulator;
    },
    {} as Record<HeritageCategory, string>,
  );

export default function HeritageScreen({ navigation }: HeritageScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<HeritageCategory | null>(null);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCategoryPress = useCallback((key: HeritageCategory) => {
    setSelectedCategory((previous) => (previous === key ? null : key));
  }, []);

  const filteredSpots = selectedCategory
    ? SAMPLE_HERITAGE_SPOTS.filter((spot) => spot.category === selectedCategory)
    : SAMPLE_HERITAGE_SPOTS;

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Heritage"
        subtitle="Discover historical places and cultural landmarks."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <Text style={styles.noticeText}>
          Showing sample heritage spots — the full heritage catalog and
          location-aware discovery will be connected in a future update.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter by Category</Text>
        <View style={styles.categoryGrid}>
          {HERITAGE_CATEGORY_OPTIONS.map((category) => {
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
              ? `${CATEGORY_LABEL_BY_KEY[selectedCategory]} Spots`
              : 'All Heritage Spots'}
          </Text>
          {selectedCategory ? (
            <Pressable onPress={() => setSelectedCategory(null)} hitSlop={8}>
              <Text style={styles.clearFilterText}>Clear filter</Text>
            </Pressable>
          ) : null}
        </View>

        {filteredSpots.length === 0 ? (
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No sample heritage spots in this category yet.
            </Text>
          </AppCard>
        ) : (
          filteredSpots.map((spot) => (
            <AppCard key={spot.id} elevation="sm" style={styles.spotCard}>
              <View style={styles.spotCardHeader}>
                <Text style={styles.spotName} numberOfLines={1}>
                  {spot.name}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {CATEGORY_LABEL_BY_KEY[spot.category]}
                  </Text>
                </View>
              </View>
              <Text style={styles.spotEra}>{spot.era}</Text>
              <Text style={styles.spotDescription}>{spot.description}</Text>
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
    lineHeight: 16,
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
  spotCard: {
    marginBottom: theme.spacing.sm,
  },
  spotCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  spotName: {
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
  spotEra: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  spotDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
});

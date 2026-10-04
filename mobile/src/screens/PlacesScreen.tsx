import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { useTheme } from '../context/ThemeContext';
import { usePlaces } from '../hooks/usePlaces';
import {
  SERVICE_CATEGORY_OPTIONS,
  ServiceCategory,
} from '../types/publicService';

type PlacesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Places'
>;

interface PlacesScreenProps {
  navigation: PlacesScreenNavigationProp;
}

const CATEGORY_LABEL_BY_KEY: Record<ServiceCategory, string> =
  SERVICE_CATEGORY_OPTIONS.reduce(
    (accumulator, option) => {
      accumulator[option.key] = option.label;
      return accumulator;
    },
    {} as Record<ServiceCategory, string>,
  );

export default function PlacesScreen({ navigation }: PlacesScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [locationNoticeVisible, setLocationNoticeVisible] = useState(false);

  const { status, services, errorMessage, refetch } =
    usePlaces(selectedCategory);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCategoryPress = useCallback((key: ServiceCategory) => {
    setSelectedCategory((previous) => (previous === key ? null : key));
  }, []);

  const handleUseCurrentLocationPress = useCallback(() => {
    setLocationNoticeVisible(true);
  }, []);

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
              Showing all places — location not attached
            </Text>
          </View>
          <Text style={styles.noticeText}>
            Location services will be connected in a future update.
          </Text>
          {locationNoticeVisible ? (
            <Text style={styles.noticeTextConfirm}>
              GPS is not connected yet — results below are not sorted by
              distance from you.
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
          {SERVICE_CATEGORY_OPTIONS.map((category) => {
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

        {status === 'loading' ? (
          <AppCard elevation="sm">
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading places...</Text>
            </View>
          </AppCard>
        ) : null}

        {status === 'error' ? (
          <AppCard elevation="sm" style={styles.errorCard}>
            <Text style={styles.errorTitle}>Couldn&apos;t load places</Text>
            <Text style={styles.errorMessage}>
              {errorMessage ?? 'Please try again.'}
            </Text>
            <AppButton
              label="Retry"
              onPress={refetch}
              variant="outline"
              style={styles.errorRetryButton}
            />
          </AppCard>
        ) : null}

        {status === 'empty' ? (
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No places found in this category.
            </Text>
          </AppCard>
        ) : null}

        {status === 'success'
          ? services.map((service) => (
              <Pressable
                key={service._id}
                onPress={() => {
                  if (service.location?.coordinates) {
                    navigation.navigate('Home', {
                      screen: 'Map',
                      params: {
                        targetPlace: {
                          id: service._id,
                          name: service.name,
                          category: CATEGORY_LABEL_BY_KEY[service.category],
                          coordinates: service.location.coordinates,
                          address: service.address,
                        },
                      }
                    });
                  }
                }}
              >
                <AppCard
                  elevation="sm"
                  style={styles.placeCard}
                >
                  <View style={styles.placeCardHeader}>
                    <Text style={styles.placeName} numberOfLines={1}>
                      {service.name}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {CATEGORY_LABEL_BY_KEY[service.category]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.placeAddress}>{service.address}</Text>
                </AppCard>
              </Pressable>
            ))
          : null}
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
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
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  categoryChipText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  categoryChipTextSelected: {
    color: theme.colors.primary,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearFilterText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  errorCard: {
    borderColor: theme.colors.error,
  },
  errorTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  errorRetryButton: {
    alignSelf: 'flex-start',
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
    color: theme.colors.text,
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
  },
});

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useHeritage } from '../hooks/useHeritage';
import { PLACE_CATEGORY_OPTIONS, PlaceCategory } from '../types/place';
import {
  fetchMyPlaceReviewIds,
  HeritageServiceError,
  submitPlaceReview,
} from '../services/heritageService';

type HeritageScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Heritage'
>;

interface HeritageScreenProps {
  navigation: HeritageScreenNavigationProp;
}

const CATEGORY_LABEL_BY_KEY: Record<PlaceCategory, string> =
  PLACE_CATEGORY_OPTIONS.reduce(
    (accumulator, option) => {
      accumulator[option.key] = option.label;
      return accumulator;
    },
    {} as Record<PlaceCategory, string>,
  );

export default function HeritageScreen({ navigation }: HeritageScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedCategory, setSelectedCategory] =
    useState<PlaceCategory | null>(null);
  const [reviewedPlaceIds, setReviewedPlaceIds] = useState<Set<string>>(
    new Set(),
  );
  const [reviewLookupError, setReviewLookupError] = useState<string | null>(
    null,
  );
  const [reviewingPlaceId, setReviewingPlaceId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const reviewSubmissionInProgress = useRef(false);

  const { status, places, errorMessage, refetch, favoritedPlaceIds, toggleFavorite } =
    useHeritage(selectedCategory);

  useEffect(() => {
    let isActive = true;

    fetchMyPlaceReviewIds()
      .then((ids) => {
        if (isActive) {
          setReviewedPlaceIds(new Set(ids));
          setReviewLookupError(null);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setReviewLookupError(
            error instanceof HeritageServiceError
              ? error.message
              : 'Unable to check your existing place reviews.',
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCategoryPress = useCallback((key: PlaceCategory) => {
    setSelectedCategory((previous) => (previous === key ? null : key));
  }, []);

  const handleStartReview = useCallback((placeId: string) => {
    setReviewingPlaceId(placeId);
    setReviewRating(5);
    setReviewComment('');
    setReviewError(null);
  }, []);

  const handleSubmitReview = useCallback(async () => {
    if (!reviewingPlaceId || reviewSubmissionInProgress.current) {
      return;
    }

    reviewSubmissionInProgress.current = true;
    setIsSubmittingReview(true);
    setReviewError(null);

    try {
      await submitPlaceReview(
        reviewingPlaceId,
        reviewRating,
        reviewComment.trim(),
      );
      setReviewedPlaceIds((previous) => new Set(previous).add(reviewingPlaceId));
      setReviewingPlaceId(null);
      setReviewComment('');
      refetch();
    } catch (error) {
      setReviewError(
        error instanceof HeritageServiceError
          ? error.message
          : 'Unable to submit your review. Please try again.',
      );
    } finally {
      reviewSubmissionInProgress.current = false;
      setIsSubmittingReview(false);
    }
  }, [refetch, reviewComment, reviewRating, reviewingPlaceId]);

  const handleCancelReview = useCallback(() => {
    setReviewingPlaceId(null);
    setReviewError(null);
  }, []);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Heritage"
        subtitle="Discover historical places and cultural landmarks."
        onBackPress={handleBackPress}
      />

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
              ? `${CATEGORY_LABEL_BY_KEY[selectedCategory]} Spots`
              : 'All Heritage Spots'}
          </Text>
          {selectedCategory ? (
            <Pressable onPress={() => setSelectedCategory(null)} hitSlop={8}>
              <Text style={styles.clearFilterText}>Clear filter</Text>
            </Pressable>
          ) : null}
        </View>

        {reviewLookupError ? (
          <Text style={styles.reviewNotice}>
            {reviewLookupError} The server will still prevent duplicate reviews.
          </Text>
        ) : null}

        {status === 'loading' ? (
          <AppCard elevation="sm">
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>
                Loading heritage spots...
              </Text>
            </View>
          </AppCard>
        ) : null}

        {status === 'error' ? (
          <AppCard elevation="sm" style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              Couldn&apos;t load heritage spots
            </Text>
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
              No heritage spots found in this category.
            </Text>
          </AppCard>
        ) : null}

        {status === 'success'
          ? places.map((place) => {
              const isFavorited = favoritedPlaceIds.has(place._id);
              return (
                <AppCard
                  key={place._id}
                  elevation="sm"
                  style={styles.spotCard}
                >
                  <View style={styles.spotCardHeader}>
                    <Text style={styles.spotName} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {CATEGORY_LABEL_BY_KEY[place.category]}
                      </Text>
                    </View>
                  </View>
                  {place.address ? (
                    <Text style={styles.spotAddress}>{place.address}</Text>
                  ) : null}
                  <Text style={styles.spotDescription} numberOfLines={3}>
                    {place.description}
                  </Text>
                  <Text style={styles.reviewSummary}>
                    {place.totalReviews > 0
                      ? `${place.averageRating.toFixed(1)} / 5 · ${place.totalReviews} review${place.totalReviews === 1 ? '' : 's'}`
                      : 'No reviews yet'}
                  </Text>

                  <Pressable
                    style={styles.favoriteButton}
                    onPress={async () => {
                      await toggleFavorite(place);
                    }}
                  >
                    <Text
                      style={[
                        styles.favoriteText,
                        isFavorited && styles.favoriteTextActive,
                      ]}
                    >
                      {isFavorited ? '\u2605' : '\u2606'} {place.favorites}
                    </Text>
                  </Pressable>

                  {reviewedPlaceIds.has(place._id) ? (
                    <Text style={styles.reviewedLabel}>You reviewed this place</Text>
                  ) : reviewingPlaceId === place._id ? (
                    <View style={styles.reviewForm}>
                      <Text style={styles.reviewFormLabel}>Your rating</Text>
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Pressable
                            key={rating}
                            onPress={() => setReviewRating(rating)}
                            disabled={isSubmittingReview}
                            accessibilityRole="button"
                            accessibilityLabel={`${rating} star${rating === 1 ? '' : 's'}`}
                            accessibilityState={{ selected: reviewRating === rating }}
                            style={[
                              styles.ratingButton,
                              reviewRating === rating && styles.ratingButtonSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.ratingText,
                                reviewRating === rating && styles.ratingTextSelected,
                              ]}
                            >
                              {rating}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <AppInput
                        label="Comment (optional)"
                        placeholder="Share a few details"
                        value={reviewComment}
                        onChangeText={setReviewComment}
                        multiline
                        maxLength={500}
                        textAlignVertical="top"
                        editable={!isSubmittingReview}
                      />
                      {reviewError ? (
                        <Text style={styles.reviewError}>{reviewError}</Text>
                      ) : null}
                      <View style={styles.reviewActions}>
                        <AppButton
                          label="Cancel"
                          onPress={handleCancelReview}
                          variant="outline"
                          disabled={isSubmittingReview}
                          style={styles.reviewActionButton}
                        />
                        <AppButton
                          label="Submit Review"
                          onPress={handleSubmitReview}
                          loading={isSubmittingReview}
                          disabled={isSubmittingReview}
                          style={styles.reviewActionButton}
                        />
                      </View>
                    </View>
                  ) : (
                    <AppButton
                      label="Write a Review"
                      onPress={() => handleStartReview(place._id)}
                      variant="outline"
                      style={styles.reviewStartButton}
                    />
                  )}
                </AppCard>
              );
            })
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
  spotAddress: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.xs,
  },
  spotDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  reviewNotice: {
    color: theme.colors.warning,
    fontSize: theme.typography.fontSizes.xs,
    marginBottom: theme.spacing.md,
  },
  reviewSummary: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.sm,
  },
  reviewedLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    marginTop: theme.spacing.sm,
  },
  reviewStartButton: {
    marginTop: theme.spacing.sm,
  },
  reviewForm: {
    marginTop: theme.spacing.md,
  },
  reviewFormLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    marginBottom: theme.spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  ratingButton: {
    minWidth: 40,
    minHeight: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  ratingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  ratingTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.bold,
  },
  reviewError: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.sm,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  reviewActionButton: {
    flex: 1,
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  favoriteText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  favoriteTextActive: {
    color: theme.colors.primary,
  },
});

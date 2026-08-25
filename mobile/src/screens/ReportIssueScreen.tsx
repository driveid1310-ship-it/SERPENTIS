import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { theme } from '../theme';

type ReportIssueScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportIssue'
>;

interface ReportIssueScreenProps {
  navigation: ReportIssueScreenNavigationProp;
}

type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'water-leakage'
  | 'streetlight'
  | 'traffic'
  | 'pollution'
  | 'stray-animals'
  | 'other';

type ReportSeverity = 'low' | 'medium' | 'high';

interface CategoryOption {
  key: ReportCategory;
  label: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'pothole', label: 'Pothole' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'water-leakage', label: 'Water Leakage' },
  { key: 'streetlight', label: 'Streetlight' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'pollution', label: 'Pollution' },
  { key: 'stray-animals', label: 'Stray Animals' },
  { key: 'other', label: 'Other' },
];

const SEVERITY_OPTIONS: { key: ReportSeverity; label: string }[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

interface FormErrors {
  category?: string;
  severity?: string;
  description?: string;
}

const MIN_DESCRIPTION_LENGTH = 10;
// Purely cosmetic — demonstrates the button's loading state. No network
// call happens; nothing is submitted anywhere.
const SUBMIT_LOADING_DEMO_MS = 500;

export default function ReportIssueScreen({
  navigation,
}: ReportIssueScreenProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] =
    useState<ReportSeverity | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Photo and location are UI-only in this build — no image-picker or
  // geolocation package is installed. These flags just control whether
  // the honest "not connected yet" notice is shown after the user taps
  // the related action.
  const [photoNoticeVisible, setPhotoNoticeVisible] = useState(false);
  const [locationNoticeVisible, setLocationNoticeVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotConnectedNoticeVisible, setIsNotConnectedNoticeVisible] =
    useState(false);

  const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePhotoActionPress = useCallback(() => {
    setPhotoNoticeVisible(true);
  }, []);

  const handleUseCurrentLocationPress = useCallback(() => {
    setLocationNoticeVisible(true);
  }, []);

  const handleCategoryPress = useCallback((key: ReportCategory) => {
    setSelectedCategory((previous) => (previous === key ? null : key));
    setErrors((previous) => ({ ...previous, category: undefined }));
  }, []);

  const handleSeverityPress = useCallback((key: ReportSeverity) => {
    setSelectedSeverity(key);
    setErrors((previous) => ({ ...previous, severity: undefined }));
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setErrors((previous) => ({ ...previous, description: undefined }));
  }, []);

  const handleAnonymousToggle = useCallback(() => {
    setIsAnonymous((previous) => !previous);
  }, []);

  const validateForm = useCallback((): boolean => {
    const nextErrors: FormErrors = {};

    if (!selectedCategory) {
      nextErrors.category = 'Please select a category for this issue.';
    }

    if (!selectedSeverity) {
      nextErrors.severity = 'Please select a severity level.';
    }

    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      nextErrors.description = `Please describe the issue in at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [selectedCategory, selectedSeverity, description]);

  const handleSubmitPress = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    setIsNotConnectedNoticeVisible(false);
    setIsSubmitting(true);

    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setIsNotConnectedNoticeVisible(true);
    }, SUBMIT_LOADING_DEMO_MS);
  }, [validateForm]);

  const handleEditReportPress = useCallback(() => {
    setIsNotConnectedNoticeVisible(false);
  }, []);

  return (
    <Screen scrollable keyboardAvoiding>
      <Header
        title="Report an Issue"
        subtitle="Help improve your community — report a civic problem."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evidence / Photo</Text>
        <AppCard elevation="sm">
          <Pressable
            style={styles.photoPlaceholder}
            onPress={handlePhotoActionPress}
          >
            <Text style={styles.photoPlaceholderIcon}>{'\uD83D\uDCF7'}</Text>
            <Text style={styles.photoPlaceholderText}>
              Add a photo of the issue
            </Text>
            <Text style={styles.photoPlaceholderSubtext}>
              Clear photos help your report get resolved faster
            </Text>
          </Pressable>
          <View style={styles.rowButtons}>
            <AppButton
              label="Camera"
              onPress={handlePhotoActionPress}
              variant="outline"
              style={styles.rowButton}
            />
            <AppButton
              label="Gallery"
              onPress={handlePhotoActionPress}
              variant="secondary"
              style={styles.rowButton}
            />
          </View>
          {photoNoticeVisible ? (
            <Text style={styles.noticeText}>
              Photo capture isn&apos;t connected yet in this build.
            </Text>
          ) : null}
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <AppCard elevation="sm">
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.locationPlaceholder}>
              No location attached
            </Text>
          </View>
          <Text style={styles.noticeText}>
            Location services will be connected in a future update.
          </Text>
          {locationNoticeVisible ? (
            <Text style={styles.noticeTextConfirm}>
              GPS is not connected yet — this report will be submitted
              without a precise location.
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
        <Text style={styles.sectionTitle}>Issue Category</Text>
        {errors.category ? (
          <Text style={styles.fieldErrorText}>{errors.category}</Text>
        ) : null}
        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.map((category) => {
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Severity</Text>
        {errors.severity ? (
          <Text style={styles.fieldErrorText}>{errors.severity}</Text>
        ) : null}
        <View style={styles.severityRow}>
          {SEVERITY_OPTIONS.map((option) => {
            const isSelected = selectedSeverity === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => handleSeverityPress(option.key)}
                style={[
                  styles.severityChip,
                  isSelected && styles.severityChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.severityChipText,
                    isSelected && styles.severityChipTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <AppInput
          placeholder="Describe the issue..."
          value={description}
          onChangeText={handleDescriptionChange}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          errorMessage={errors.description}
        />
      </View>

      <View style={styles.section}>
        <Pressable style={styles.anonymousRow} onPress={handleAnonymousToggle}>
          <View style={styles.anonymousTextContainer}>
            <Text style={styles.anonymousLabel}>Submit anonymously</Text>
            <Text style={styles.anonymousDescription}>
              Your name will not be shown alongside this report.
            </Text>
          </View>
          <View
            style={[
              styles.toggleTrack,
              isAnonymous && styles.toggleTrackActive,
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                isAnonymous && styles.toggleThumbActive,
              ]}
            />
          </View>
        </Pressable>
      </View>

      {isNotConnectedNoticeVisible ? (
        <View style={styles.section}>
          <AppCard elevation="sm" style={styles.notConnectedCard}>
            <Text style={styles.notConnectedTitle}>
              Submission not connected yet
            </Text>
            <Text style={styles.notConnectedMessage}>
              This screen is UI-only in the current build. Your report was
              not sent — backend submission will be wired up in a future
              update.
            </Text>
            <AppButton
              label="Edit Report"
              onPress={handleEditReportPress}
              variant="outline"
            />
          </AppCard>
        </View>
      ) : null}

      <View style={[styles.section, styles.lastSection]}>
        <AppButton
          label="REPORT ISSUE"
          onPress={handleSubmitPress}
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        />
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
  fieldErrorText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
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
  photoPlaceholder: {
    minHeight: 140,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  photoPlaceholderIcon: {
    fontSize: 30,
    marginBottom: theme.spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  photoPlaceholderSubtext: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  rowButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  rowButton: {
    flex: 1,
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
  severityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  severityChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityChipSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.primaryLight,
  },
  severityChipText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  severityChipTextSelected: {
    color: theme.colors.accent,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  anonymousTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  anonymousLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  anonymousDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  toggleTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: theme.colors.accent,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  notConnectedCard: {
    borderColor: theme.colors.warning,
  },
  notConnectedTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  notConnectedMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
});

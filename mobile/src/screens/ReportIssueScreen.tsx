import React, { useCallback, useState } from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import ResultView from '../components/Result/ResultView';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { useTheme } from '../context/ThemeContext';
import { useReports } from '../hooks/useReports';
import { useLocation } from '../hooks/useLocation';
import {
  ReportImageUploadError,
  uploadReportImage,
} from '../services/reportService';

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

// Deterministic title for a report, derived from its category. The backend
// requires a title (min 3 characters) but this screen has no title input,
// so every generated value below is a fixed, human-readable string well
// over that minimum.
const REPORT_TITLE_BY_CATEGORY: Record<ReportCategory, string> = {
  pothole: 'Pothole Report',
  garbage: 'Garbage Report',
  'water-leakage': 'Water Leakage Report',
  streetlight: 'Streetlight Report',
  traffic: 'Traffic Report',
  pollution: 'Pollution Report',
  'stray-animals': 'Stray Animal Report',
  other: 'Issue Report',
};

function generateReportTitle(category: ReportCategory): string {
  return REPORT_TITLE_BY_CATEGORY[category];
}

interface FormErrors {
  category?: string;
  severity?: string;
  description?: string;
  location?: string;
}

const MIN_DESCRIPTION_LENGTH = 10;

export default function ReportIssueScreen({
  navigation,
}: ReportIssueScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] =
    useState<ReportSeverity | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedPhoto, setSelectedPhoto] = useState<Asset | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const {
    location,
    status: locationStatus,
    message: locationMessage,
    requestLocation,
  } = useLocation();

  const { status, submittedReport, submit, reset } =
    useReports();
  const isSubmitting = status === 'submitting';

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePickedPhoto = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      setPhotoError(
        response.errorCode === 'camera_unavailable'
          ? 'The camera is unavailable on this device.'
          : response.errorCode === 'permission'
            ? 'Camera permission is required to take a photo.'
            : 'Unable to open the photo picker. Please try again.',
      );
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      setPhotoError('The selected photo could not be accessed. Please try again.');
      return;
    }

    setSelectedPhoto(asset);
    setUploadedPhotoUrl(null);
    setPhotoError(null);
  }, []);

  const handleGalleryPress = useCallback(async () => {
    setPhotoError(null);
    setIsPickingPhoto(true);
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        restrictMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });
      handlePickedPhoto(response);
    } catch {
      setPhotoError('Unable to open the photo library. Please try again.');
    } finally {
      setIsPickingPhoto(false);
    }
  }, [handlePickedPhoto]);

  const handleCameraPress = useCallback(async () => {
    setPhotoError(null);
    setIsPickingPhoto(true);
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera permission',
            message: 'SERPENTIS needs camera access to take a report photo.',
            buttonPositive: 'Continue',
            buttonNegative: 'Cancel',
          },
        );

        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setPhotoError(
            permission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
              ? 'Camera permission is blocked. Enable it in Android Settings to take a photo.'
              : 'Camera permission was denied. Allow camera access to take a photo.',
          );
          return;
        }
      }

      const response = await launchCamera({
        mediaType: 'photo',
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });
      handlePickedPhoto(response);
    } catch {
      setPhotoError('Unable to open the camera. Please try again.');
    } finally {
      setIsPickingPhoto(false);
    }
  }, [handlePickedPhoto]);

  const handleRemovePhotoPress = useCallback(() => {
    setSelectedPhoto(null);
    setUploadedPhotoUrl(null);
    setPhotoError(null);
  }, []);

  const handleUseCurrentLocationPress = useCallback(() => {
    requestLocation();
  }, [requestLocation]);

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

    if (!location) {
      nextErrors.location =
        'A location is required to submit a report, and GPS isn\u2019t connected yet in this build.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [selectedCategory, selectedSeverity, description, location]);

  const handleSubmitPress = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    if (!selectedCategory || !selectedSeverity || !location) {
      return;
    }

    setPhotoError(null);
    let imageUrls: string[] = [];
    if (selectedPhoto) {
      if (uploadedPhotoUrl) {
        imageUrls = [uploadedPhotoUrl];
      } else {
        setIsUploadingPhoto(true);
        try {
          const url = await uploadReportImage(selectedPhoto);
          setUploadedPhotoUrl(url);
          imageUrls = [url];
        } catch (error) {
          setPhotoError(
            error instanceof ReportImageUploadError
              ? error.message
              : 'Unable to upload this photo. Please try again.',
          );
          return;
        } finally {
          setIsUploadingPhoto(false);
        }
      }
    }

    await submit({
      title: generateReportTitle(selectedCategory),
      description: description.trim(),
      category: selectedCategory,
      images: imageUrls,
      location,
      priority: selectedSeverity,
      isAnonymous,
    });
  }, [
    validateForm,
    selectedCategory,
    selectedSeverity,
    description,
    location,
    selectedPhoto,
    uploadedPhotoUrl,
    isAnonymous,
    submit,
  ]);

  const handleResetPress = useCallback(() => {
    reset();
  }, [reset]);

  

  const isBusy = isSubmitting || isPickingPhoto || isUploadingPhoto;

  
  if (status === 'success' && submittedReport) {
    return (
      <ResultView
        status="success"
        title="REPORT SUBMITTED"
        description="Your report has been successfully submitted to SERPENTIS."
        referenceId={submittedReport._id}
        primaryAction={{
          label: 'VIEW REPORT',
          onPress: () => navigation.replace('ReportDetails', { reportId: submittedReport._id }),
        }}
        secondaryAction={{
          label: 'DONE',
          onPress: () => navigation.goBack(),
        }}
      />
    );
  }

  if (status === 'error') {
    return (
      <ResultView
        status="failure"
        title="SUBMISSION FAILED"
        description="We couldn't submit your report. Please check your connection and try again."
        primaryAction={{
          label: 'TRY AGAIN',
          onPress: handleResetPress,
        }}
        secondaryAction={{
          label: 'CANCEL',
          onPress: () => navigation.goBack(),
        }}
      />
    );
  }

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
          {selectedPhoto?.uri ? (
            <View style={styles.selectedPhotoContainer}>
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.photoPreview}
                resizeMode="cover"
                accessibilityLabel="Selected report photo"
              />
              <Pressable
                onPress={handleRemovePhotoPress}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Remove selected photo"
                style={styles.removePhotoButton}
              >
                <Text style={styles.removePhotoText}>Remove photo</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>{'\uD83D\uDCF7'}</Text>
              <Text style={styles.photoPlaceholderText}>
                Add a photo of the issue
              </Text>
              <Text style={styles.photoPlaceholderSubtext}>
                Clear photos help your report get resolved faster
              </Text>
            </View>
          )}
          <View style={styles.rowButtons}>
            <AppButton
              label="Camera"
              onPress={handleCameraPress}
              variant="outline"
              style={styles.rowButton}
              loading={isPickingPhoto}
              disabled={isBusy}
            />
            <AppButton
              label="Gallery"
              onPress={handleGalleryPress}
              variant="secondary"
              style={styles.rowButton}
              disabled={isBusy}
            />
          </View>
          {isUploadingPhoto ? (
            <Text style={styles.noticeText}>Uploading photo...</Text>
          ) : null}
          {uploadedPhotoUrl ? (
            <Text style={styles.noticeText}>Photo uploaded and ready to submit.</Text>
          ) : null}
          {photoError ? (
            <Text style={styles.photoErrorText}>{photoError}</Text>
          ) : null}
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <AppCard elevation="sm">
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.locationPlaceholder}>
              {location
                ? `${location.coordinates[1].toFixed(5)}, ${location.coordinates[0].toFixed(5)}`
                : 'No location attached'}
            </Text>
          </View>
          <Text style={styles.noticeText}>
            {locationStatus === 'checking'
              ? 'Getting your current location\u2026'
              : 'Tap below to attach your current location.'}
          </Text>
          {locationMessage ? (
            <Text style={styles.noticeTextConfirm}>{locationMessage}</Text>
          ) : null}
          {errors.location ? (
            <Text style={styles.fieldErrorText}>{errors.location}</Text>
          ) : null}
          <AppButton
            label="Use Current Location"
            onPress={handleUseCurrentLocationPress}
            variant="outline"
            loading={locationStatus === 'checking'}
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

      

      

      <View style={[styles.section, styles.lastSection]}>
        <AppButton
          label="REPORT ISSUE"
          onPress={handleSubmitPress}
          variant="primary"
          loading={isSubmitting || isUploadingPhoto}
          disabled={isBusy}
        />
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
  fieldErrorText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.error,
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
  selectedPhotoContainer: {
    marginBottom: theme.spacing.md,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
  },
  removePhotoButton: {
    alignSelf: 'flex-end',
    paddingTop: theme.spacing.sm,
  },
  removePhotoText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  photoErrorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSizes.xs,
    marginTop: theme.spacing.xs,
  },
  photoPlaceholderIcon: {
    fontSize: 30,
    marginBottom: theme.spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
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
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  severityChipText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  severityChipTextSelected: {
    color: theme.colors.primary,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primary,
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
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  notConnectedMessage: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

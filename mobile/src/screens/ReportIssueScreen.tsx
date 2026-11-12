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
import { useCity } from '../context/CityContext';
import { useReports } from '../hooks/useReports';
import { useLocation } from '../hooks/useLocation';
import {
  ReportImageUploadError,
  uploadReportImage,
} from '../services/reportService';
import type {
  FoodSafetyConcernType,
  ReportCategory,
  ReportSeverity,
} from '../types/report';

type ReportIssueScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ReportIssue'
>;

interface ReportIssueScreenProps {
  navigation: ReportIssueScreenNavigationProp;
}

interface CategoryOption {
  key: ReportCategory;
  label: string;
  group: 'civic' | 'environmental';
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'pothole', label: 'Pothole', group: 'civic' },
  { key: 'garbage', label: 'Garbage', group: 'civic' },
  { key: 'water-leakage', label: 'Water Leakage', group: 'civic' },
  { key: 'streetlight', label: 'Streetlight', group: 'civic' },
  { key: 'traffic', label: 'Traffic', group: 'civic' },
  { key: 'stray-animals', label: 'Stray Animals', group: 'civic' },
  { key: 'food-safety', label: 'Food Safety', group: 'civic' },
  { key: 'other', label: 'Other Civic', group: 'civic' },
  { key: 'air-pollution', label: 'Air Pollution', group: 'environmental' },
  { key: 'water-contamination', label: 'Water Contamination', group: 'environmental' },
  { key: 'noise-pollution', label: 'Noise Pollution', group: 'environmental' },
  { key: 'tree-cutting', label: 'Tree Cutting', group: 'environmental' },
  { key: 'waterlogging', label: 'Waterlogging', group: 'environmental' },
  { key: 'drainage-blockage', label: 'Drainage Blockage', group: 'environmental' },
  { key: 'industrial-pollution', label: 'Industrial Pollution', group: 'environmental' },
  { key: 'open-burning', label: 'Open Burning', group: 'environmental' },
  { key: 'pollution', label: 'General Pollution', group: 'environmental' },
  { key: 'environmental-other', label: 'Other Environmental', group: 'environmental' },
];

const ENVIRONMENTAL_CATEGORY_KEYS = new Set<ReportCategory>(
  CATEGORY_OPTIONS.filter((c) => c.group === 'environmental').map((c) => c.key),
);

const FOOD_CONCERN_OPTIONS: { key: FoodSafetyConcernType; label: string }[] = [
  { key: 'hygiene', label: 'Unsanitary Premises' },
  { key: 'foreign-object', label: 'Foreign Object' },
  { key: 'expired', label: 'Expired Item' },
  { key: 'food-poisoning', label: 'Food Poisoning' },
  { key: 'adulteration', label: 'Adulteration' },
  { key: 'misbranding', label: 'Misleading Label' },
  { key: 'other', label: 'Other Concern' },
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
  'food-safety': 'Food Safety Incident Report',
  'air-pollution': 'Air Pollution Report',
  'water-contamination': 'Water Contamination Report',
  'noise-pollution': 'Noise Pollution Report',
  'tree-cutting': 'Tree Cutting Report',
  waterlogging: 'Waterlogging Report',
  'drainage-blockage': 'Drainage Blockage Report',
  'industrial-pollution': 'Industrial Pollution Report',
  'open-burning': 'Open Burning Report',
  'environmental-other': 'Environmental Issue Report',
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
  const { selectedCity } = useCity();
  const styles = getStyles(theme);
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [categoryGroup, setCategoryGroup] = useState<'civic' | 'environmental'>('civic');
  const [suspectedSource, setSuspectedSource] = useState('');
  const [noiseEstimateInput, setNoiseEstimateInput] = useState('');
  const [waterNoteInput, setWaterNoteInput] = useState('');
  const [selectedSeverity, setSelectedSeverity] =
    useState<ReportSeverity | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [establishmentName, setEstablishmentName] = useState('');
  const [foodItem, setFoodItem] = useState('');
  const [concernType, setConcernType] =
    useState<FoodSafetyConcernType>('hygiene');
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

    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      setPhotoError('Please select an image smaller than 5 MB.');
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

    const foodSafetyDetails =
      selectedCategory === 'food-safety'
        ? {
            establishmentName: establishmentName.trim() || undefined,
            foodItem: foodItem.trim() || undefined,
            concernType,
            incidentDate: new Date().toISOString(),
            officialFiling: {
              status: 'not_filed' as const,
            },
          }
        : undefined;

    const isEnvironmental = ENVIRONMENTAL_CATEGORY_KEYS.has(selectedCategory);
    const parsedNoise = Number(noiseEstimateInput);
    const environmentalDetails = isEnvironmental
      ? {
          suspectedSource: suspectedSource.trim() || undefined,
          noiseDecibelsEstimate:
            selectedCategory === 'noise-pollution' &&
            noiseEstimateInput.trim() !== '' &&
            Number.isFinite(parsedNoise)
              ? parsedNoise
              : undefined,
          waterTurbidityNote:
            selectedCategory === 'water-contamination' && waterNoteInput.trim() !== ''
              ? waterNoteInput.trim()
              : undefined,
          isCitizenEstimate: true,
        }
      : undefined;

    await submit({
      title: generateReportTitle(selectedCategory),
      description: description.trim(),
      category: selectedCategory,
      images: imageUrls,
      location,
      priority: selectedSeverity,
      isAnonymous,
      foodSafetyDetails,
      environmentalDetails,
      locationMeta: {
        city: selectedCity.city,
        district: selectedCity.district,
        state: selectedCity.state,
        locality: selectedCity.locality,
      },
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
    establishmentName,
    foodItem,
    concernType,
    suspectedSource,
    noiseEstimateInput,
    waterNoteInput,
    selectedCity,
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
        <View style={styles.rowButtons}>
          <Pressable
            onPress={() => setCategoryGroup('civic')}
            style={[
              styles.categoryChip,
              styles.rowButton,
              categoryGroup === 'civic' && styles.categoryChipSelected,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                categoryGroup === 'civic' && styles.categoryChipTextSelected,
              ]}
            >
              Civic Issues
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCategoryGroup('environmental')}
            style={[
              styles.categoryChip,
              styles.rowButton,
              categoryGroup === 'environmental' && styles.categoryChipSelected,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                categoryGroup === 'environmental' && styles.categoryChipTextSelected,
              ]}
            >
              Environmental
            </Text>
          </Pressable>
        </View>
        {errors.category ? (
          <Text style={styles.fieldErrorText}>{errors.category}</Text>
        ) : null}
        <View style={styles.categoryGrid}>
          {CATEGORY_OPTIONS.filter((c) => c.group === categoryGroup).map((category) => {
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

      {selectedCategory && ENVIRONMENTAL_CATEGORY_KEYS.has(selectedCategory) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Environmental Observation Details</Text>
          <AppCard elevation="sm">
            <Text style={styles.noticeText}>
              Citizen observations are recorded separately from official CPCB/IMD monitoring station measurements.
            </Text>
            <View style={styles.fieldSpacing}>
              <Text style={styles.inputSubLabel}>Suspected Source (Optional)</Text>
              <AppInput
                placeholder="e.g. Open waste burning, industrial discharge, blocked culvert"
                value={suspectedSource}
                onChangeText={setSuspectedSource}
              />
            </View>
            {selectedCategory === 'noise-pollution' ? (
              <View style={styles.fieldSpacing}>
                <Text style={styles.inputSubLabel}>Estimated Noise Level dBA (Optional)</Text>
                <AppInput
                  placeholder="e.g. 85 (citizen estimate)"
                  value={noiseEstimateInput}
                  onChangeText={setNoiseEstimateInput}
                  keyboardType="numeric"
                />
              </View>
            ) : null}
            {selectedCategory === 'water-contamination' ? (
              <View style={styles.fieldSpacing}>
                <Text style={styles.inputSubLabel}>Water Appearance / Odor Note (Optional)</Text>
                <AppInput
                  placeholder="e.g. Turbid brown water with chemical smell (not lab-tested)"
                  value={waterNoteInput}
                  onChangeText={setWaterNoteInput}
                />
              </View>
            ) : null}
          </AppCard>
        </View>
      ) : null}

      {selectedCategory === 'food-safety' ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Incident Details</Text>
          <AppCard elevation="sm">
            <View style={styles.foodAdvisoryBanner}>
              <Text style={styles.foodAdvisoryTitle}>⚠️ Food Safety & Evidence Advisory</Text>
              <Text style={styles.foodAdvisoryText}>
                SERPENTIS alerts local citizens. To request a formal inspection by statutory food authorities (e.g. FSSAI), use the official channels guide on the report details screen after submission.
              </Text>
              <Text style={styles.foodAdvisoryPrivacyText}>
                🔒 Privacy Tip: If uploading a receipt, ensure personal card and phone numbers are blurred or cropped.
              </Text>
            </View>

            <View style={styles.fieldSpacing}>
              <Text style={styles.inputSubLabel}>Food Establishment / Vendor Name (Optional)</Text>
              <AppInput
                placeholder="e.g. Cafe Spice / Green Grocery"
                value={establishmentName}
                onChangeText={setEstablishmentName}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Text style={styles.inputSubLabel}>Affected Food Item / Dish (Optional)</Text>
              <AppInput
                placeholder="e.g. Fresh Milk Carton / Chicken Roll"
                value={foodItem}
                onChangeText={setFoodItem}
              />
            </View>

            <View style={styles.fieldSpacing}>
              <Text style={styles.inputSubLabel}>Concern Classification</Text>
              <View style={styles.categoryGrid}>
                {FOOD_CONCERN_OPTIONS.map((concern) => {
                  const isSelected = concernType === concern.key;
                  return (
                    <View key={concern.key} style={styles.categoryItem}>
                      <Pressable
                        onPress={() => setConcernType(concern.key)}
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
                          {concern.label}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </View>
          </AppCard>
        </View>
      ) : null}

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
  foodAdvisoryBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
  },
  foodAdvisoryTitle: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#D97706',
    marginBottom: 4,
  },
  foodAdvisoryText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  inputSubLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  foodAdvisoryPrivacyText: {
    fontSize: theme.typography.fontSizes.xs,
    color: '#D97706',
    lineHeight: 16,
    marginTop: 6,
  },
  fieldSpacing: {
    marginTop: 12,
  },
});

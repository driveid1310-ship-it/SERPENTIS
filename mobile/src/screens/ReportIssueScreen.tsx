import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import AppInput from '../components/Input/AppInput';
import { theme } from '../theme';

type SeverityLevel = 'Low' | 'Medium' | 'High';

interface CategoryConfig {
  key: string;
  label: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: 'pothole', label: 'Pothole' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'water-leakage', label: 'Water Leakage' },
  { key: 'streetlight', label: 'Streetlight' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'pollution', label: 'Pollution' },
  { key: 'stray-animals', label: 'Stray Animals' },
  { key: 'other', label: 'Other' },
];

const SEVERITY_LEVELS: SeverityLevel[] = ['Low', 'Medium', 'High'];

export default function ReportIssueScreen() {
  const navigation = useNavigation();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<
    string | null
  >(null);
  const [selectedSeverity, setSelectedSeverity] =
    useState<SeverityLevel | null>(null);
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedAddress] = useState<string | null>(null);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleCameraPress = useCallback(() => {
    // Static UI only — camera integration not implemented in this sprint.
  }, []);

  const handleGalleryPress = useCallback(() => {
    // Static UI only — gallery integration not implemented in this sprint.
  }, []);

  const handleCurrentLocationPress = useCallback(() => {
    // Static UI only — location integration not implemented in this sprint.
  }, []);

  const handleCategoryPress = useCallback((key: string) => {
    setSelectedCategoryKey((previous) => (previous === key ? null : key));
  }, []);

  const handleSeverityPress = useCallback((level: SeverityLevel) => {
    setSelectedSeverity((previous) => (previous === level ? null : level));
  }, []);

  const handleAnonymousToggle = useCallback(() => {
    setIsAnonymous((previous) => !previous);
  }, []);

  const handleSubmitPress = useCallback(() => {
    // Static UI only — submission wiring not implemented in this sprint.
  }, []);

  return (
    <Screen scrollable keyboardAvoiding>
      <Header title="Report an Issue" onBackPress={handleBackPress} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo</Text>
        <AppCard elevation="sm">
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>No photo selected</Text>
          </View>
          <View style={styles.photoActionsRow}>
            <AppButton
              label="Camera"
              onPress={handleCameraPress}
              variant="outline"
              style={styles.photoActionButton}
            />
            <AppButton
              label="Gallery"
              onPress={handleGalleryPress}
              variant="secondary"
              style={styles.photoActionButton}
            />
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <AppCard elevation="sm">
          <AppButton
            label="Use Current Location"
            onPress={handleCurrentLocationPress}
            variant="outline"
            fullWidth
          />
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Selected Address</Text>
            <Text style={styles.addressValue} numberOfLines={2}>
              {selectedAddress ?? 'No location selected yet'}
            </Text>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategoryKey === category.key;
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
        <View style={styles.severityRow}>
          {SEVERITY_LEVELS.map((level) => {
            const isSelected = selectedSeverity === level;
            return (
              <Pressable
                key={level}
                onPress={() => handleSeverityPress(level)}
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
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <AppInput
          placeholder="Describe the issue in detail..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <Pressable
          style={styles.anonymousRow}
          onPress={handleAnonymousToggle}
        >
          <View>
            <Text style={styles.anonymousLabel}>Report Anonymously</Text>
            <Text style={styles.anonymousDescription}>
              Your identity will not be shared with this report.
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
          label="Submit Report"
          onPress={handleSubmitPress}
          variant="primary"
          fullWidth
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
  photoPlaceholder: {
    height: 160,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  photoPlaceholderText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  photoActionButton: {
    flex: 1,
  },
  addressBox: {
    marginTop: theme.spacing.md,
  },
  addressLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  addressValue: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.background,
  },
  severityChipText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textSecondary,
  },
  severityChipTextSelected: {
    color: theme.colors.accent,
  },
  descriptionInput: {
    minHeight: 120,
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
  anonymousLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  anonymousDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    maxWidth: 220,
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
    backgroundColor: theme.colors.textPrimary,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.background,
  },
});
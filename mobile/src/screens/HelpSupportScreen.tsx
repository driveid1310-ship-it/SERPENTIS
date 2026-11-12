import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AppCard from '../components/Card/AppCard';
import Header from '../components/Header/Header';
import Screen from '../components/Screen/Screen';
import { useTheme } from '../context/ThemeContext';

type HelpSupportScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'HelpSupport'
>;

interface HelpSupportScreenProps {
  navigation: HelpSupportScreenNavigationProp;
}

const HELP_ITEMS = [
  {
    question: 'Reporting an issue',
    answer:
      'Choose a category and severity, describe the issue, and attach a location. A photo is optional.',
  },
  {
    question: 'Adding a location',
    answer:
      'Use Current Location on the report form and allow location access when prompted. A location is required to submit a report.',
  },
  {
    question: 'Using SOS',
    answer:
      'Open SOS, choose an available service, and review the number before your device opens the phone dialer.',
  },
  {
    question: 'Heritage places',
    answer:
      'Browse places in Heritage, save favorites, and submit a review from a place screen.',
  },
  {
    question: 'Notifications',
    answer:
      'Open Notifications from your profile to view account updates. Notification preference controls are not connected in this build.',
  },
  {
    question: 'Account and password reset',
    answer:
      'Use Forgot Password to request a one-time verification code by email, verify it, and set a new password.',
  },
  {
    question: 'Report photos',
    answer:
      'Photo uploads can fail. Retry the upload, or remove the photo and submit the report without an image.',
  },
];

export default function HelpSupportScreen({
  navigation,
}: HelpSupportScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Help & Support"
        subtitle="Guidance for using SERPENTIS."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <AppCard elevation="sm" padded={false}>
          {HELP_ITEMS.map((item, index) => (
            <View key={item.question}>
              <View style={styles.helpItem}>
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
              {index < HELP_ITEMS.length - 1 ? (
                <View style={styles.divider} />
              ) : null}
            </View>
          ))}
        </AppCard>
      </View>

      <Text style={styles.contactNote}>
        An official support contact is not configured in this build.
      </Text>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  section: {
    marginTop: theme.spacing.xl,
  },
  helpItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  question: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  answer: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 21,
  },
  divider: {
    height: 1,
    marginLeft: theme.spacing.lg,
    backgroundColor: theme.colors.border,
  },
  contactNote: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.xs,
    lineHeight: 18,
  },
});
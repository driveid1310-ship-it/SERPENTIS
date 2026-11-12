import React, { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import AppButton from '../components/Button/AppButton';
import AppCard from '../components/Card/AppCard';
import Header from '../components/Header/Header';
import Screen from '../components/Screen/Screen';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

type PrivacySecurityScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PrivacySecurity'
>;

interface PrivacySecurityScreenProps {
  navigation: PrivacySecurityScreenNavigationProp;
}

export default function PrivacySecurityScreen({
  navigation,
}: PrivacySecurityScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handlePasswordResetPress = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const confirmLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch {
      Alert.alert('Unable to log out', 'Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, navigation]);

  const handleLogoutPress = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: confirmLogout,
      },
    ]);
  }, [confirmLogout]);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Privacy & Security"
        subtitle="Account access and the controls available in this build."
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Security</Text>
        <AppCard elevation="sm">
          <Text style={styles.cardTitle}>Signed-in account</Text>
          <Text style={styles.bodyText}>{user?.email ?? 'Your account'}</Text>
          <Text style={styles.bodyText}>
            Account-only requests use your authenticated sign-in. Password
            recovery sends a one-time verification code to your account email.
            A separate current-password change is not available in this build.
          </Text>
          <AppButton
            label="Reset Password"
            onPress={handlePasswordResetPress}
            variant="secondary"
            style={styles.actionButton}
          />
          <AppButton
            label="Log Out"
            onPress={handleLogoutPress}
            variant="outline"
            loading={isLoggingOut}
            disabled={isLoggingOut}
          />
        </AppCard>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Account Data</Text>
        <AppCard elevation="sm">
          <Text style={styles.bodyText}>
            Your profile displays account details returned by SERPENTIS. Reports
            require a location and can be submitted anonymously. This build
            does not provide in-app account deletion, data export, active
            session management, or privacy preferences.
          </Text>
        </AppCard>
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
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
  },
  cardTitle: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  bodyText: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 21,
  },
  actionButton: {
    marginBottom: theme.spacing.md,
  },
});
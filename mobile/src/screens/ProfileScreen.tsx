import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { useAuth } from '../hooks/useAuth';
import { theme } from '../theme';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

interface SettingsAction {
  key: string;
  label: string;
  description: string;
  isConnected: boolean;
}

const SETTINGS_ACTIONS: SettingsAction[] = [
  {
    key: 'edit-profile',
    label: 'Edit Profile',
    description: 'Update your name and details',
    isConnected: false,
  },
  {
    key: 'change-password',
    label: 'Change Password',
    description: 'Update your account password',
    isConnected: false,
  },
  {
    key: 'notification-preferences',
    label: 'Notification Preferences',
    description: 'Choose what you get notified about',
    isConnected: false,
  },
  {
    key: 'privacy-security',
    label: 'Privacy & Security',
    description: 'Manage your data and account security',
    isConnected: false,
  },
  {
    key: 'help-support',
    label: 'Help & Support',
    description: 'Get help or contact the SERPENTIS team',
    isConnected: false,
  },
];

function formatMemberSince(isoDate: string | undefined): string {
  if (!isoDate) {
    return 'Unknown';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown';
  }

  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const [pendingNoticeLabel, setPendingNoticeLabel] = useState<string | null>(
    null,
  );

  const fullName = user?.fullName ?? 'Citizen';
  const email = user?.email ?? 'No email on file';
  const initial = fullName.charAt(0).toUpperCase() || 'C';
  const memberSince = useMemo(
    () => formatMemberSince(user?.createdAt),
    [user?.createdAt],
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSettingsActionPress = useCallback((action: SettingsAction) => {
    if (action.key === 'notification-preferences') {
      navigation.navigate('Notifications');
      return;
    }

    setPendingNoticeLabel(action.label);
  }, [navigation]);

  const handleLogoutPress = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout()
            .then(() => {
              navigation.replace('Login');
            })
            .catch(() => {
              Alert.alert(
                'Unable to log out',
                'Something went wrong. Please try again.',
              );
            });
        },
      },
    ]);
  }, [logout, navigation]);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header title="Profile" onBackPress={handleBackPress} />

      <View style={styles.section}>
        <AppCard elevation="md" style={styles.identityCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{email}</Text>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <AppCard elevation="sm">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {fullName}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {email}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>{memberSince}</Text>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <AppCard elevation="sm" padded={false}>
          {SETTINGS_ACTIONS.map((action, index) => (
            <View key={action.key}>
              <Pressable
                style={styles.settingsRow}
                onPress={() => handleSettingsActionPress(action)}
              >
                <View style={styles.settingsRowText}>
                  <Text style={styles.settingsLabel}>{action.label}</Text>
                  <Text style={styles.settingsDescription}>
                    {action.description}
                  </Text>
                </View>
                <Text style={styles.settingsChevron}>{'\u203A'}</Text>
              </Pressable>
              {index < SETTINGS_ACTIONS.length - 1 ? (
                <View style={styles.settingsDivider} />
              ) : null}
            </View>
          ))}
        </AppCard>

        {pendingNoticeLabel ? (
          <Text style={styles.noticeText}>
            {pendingNoticeLabel} isn&apos;t connected yet in this build.
          </Text>
        ) : null}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Pressable style={styles.logoutButton} onPress={handleLogoutPress}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Pressable>
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
  identityCard: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    marginBottom: theme.spacing.md,
  },
  avatarInitial: {
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.accent,
  },
  name: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    flex: 1,
    marginLeft: theme.spacing.lg,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  settingsRowText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingsLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  settingsDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  settingsChevron: {
    fontSize: theme.typography.fontSizes.xl,
    color: theme.colors.placeholder,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.lg,
  },
  noticeText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.warning,
    lineHeight: 16,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
  },
});

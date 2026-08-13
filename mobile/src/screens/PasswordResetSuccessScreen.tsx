import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { authTheme } from '../theme/authTheme';
import AuthButton from '../components/AuthButton/AuthButton';

type PasswordResetSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PasswordResetSuccess'
>;

export default function PasswordResetSuccessScreen({
  navigation,
}: PasswordResetSuccessScreenProps) {
  const handleBackToLoginPress = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  return (
    <View style={styles.flex}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconCheck}>✓</Text>
        </View>

        <Text style={styles.title}>Password Reset Successful</Text>
        <Text style={styles.subtitle}>
          Your password has been updated. Use your new password the next
          time you log in.
        </Text>

        <AuthButton
          label="Back to Login"
          onPress={handleBackToLoginPress}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: authTheme.spacing.xxl,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: authTheme.colors.accentMuted,
    borderWidth: 1,
    borderColor: authTheme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: authTheme.spacing.xxl,
  },
  iconCheck: {
    fontSize: 36,
    fontWeight: '800',
    color: authTheme.colors.accent,
  },
  title: {
    fontSize: authTheme.typography.h3,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: authTheme.spacing.md,
  },
  subtitle: {
    fontSize: authTheme.typography.fontSizes.sm,
    color: authTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: authTheme.spacing.xxxl,
  },
  button: {
    width: '100%',
  },
});

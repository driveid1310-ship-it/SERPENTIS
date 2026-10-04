import React, { useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import AuthHeader from '../components/AuthHeader/AuthHeader';
import AuthField from '../components/AuthField/AuthField';
import AuthButton from '../components/AuthButton/AuthButton';
import {
  AuthServiceError,
  resetPassword,
} from '../services/authService';

type ResetPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

export default function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleResetPress = useCallback(async () => {
    if (!newPassword || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword({
        resetToken: route.params.resetToken,
        newPassword,
      });
      navigation.replace('PasswordResetSuccess');
    } catch (resetError) {
      setError(
        resetError instanceof AuthServiceError
          ? resetError.message
          : 'Unable to reset your password. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [confirmPassword, navigation, newPassword, route.params.resetToken]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          title="Set New Password"
          subtitle="Choose a strong password you haven't used before."
          onBackPress={handleBackPress}
        />

        <View style={styles.card}>
          <AuthField
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <AuthField
            label="Confirm New Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
            errorMessage={error ?? undefined}
          />

          <AuthButton
            label="Reset Password"
            onPress={handleResetPress}
            loading={isSubmitting}
            style={styles.resetButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
  },
  resetButton: {
    marginTop: theme.spacing.sm,
  },
});

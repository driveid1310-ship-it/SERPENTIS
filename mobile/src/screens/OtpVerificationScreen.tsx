import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import AuthHeader from '../components/AuthHeader/AuthHeader';
import AuthButton from '../components/AuthButton/AuthButton';
import OtpInput from '../components/OtpInput/OtpInput';
import { useTheme } from '../context/ThemeContext';
import {
  AuthServiceError,
  requestPasswordReset,
  verifyPasswordResetOtp,
} from '../services/authService';

type OtpVerificationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'OtpVerification'
>;

export default function OtpVerificationScreen({
  navigation,
  route,
}: OtpVerificationScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(60);

  const { email } = route.params;

  useEffect(() => {
    if (resendCountdown === 0) {
      return undefined;
    }

    const countdown = setInterval(() => {
      setResendCountdown((remaining) => Math.max(0, remaining - 1));
    }, 1000);

    return () => clearInterval(countdown);
  }, [resendCountdown]);

  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);

    if (errorMessage) {
      setErrorMessage('');
    }
  }, [errorMessage]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const { resetToken } = await verifyPasswordResetOtp({ email, otp });
      setOtp('');
      navigation.replace('ResetPassword', { resetToken });
    } catch (verificationError) {
      setErrorMessage(
        verificationError instanceof AuthServiceError
          ? verificationError.message
          : 'Unable to verify this code. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [email, loading, navigation, otp]);

  const handleResend = useCallback(async () => {
    if (loading || resendCountdown > 0) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const { resendAfterSeconds } = await requestPasswordReset(email);
      setOtp('');
      setResendCountdown(resendAfterSeconds);
    } catch (resendError) {
      setErrorMessage(
        resendError instanceof AuthServiceError
          ? resendError.message
          : 'Unable to resend the code. Please try again.',
      );
      setResendCountdown(10);
    } finally {
      setLoading(false);
    }
  }, [email, loading, resendCountdown]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const resendLabel =
    resendCountdown > 0
      ? `Resend code in 00:${resendCountdown.toString().padStart(2, '0')}`
      : 'Resend code';

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <AuthHeader
            title="Verify Code"
            subtitle={`Enter the 6-digit code if an account exists for ${email}`}
            onBackPress={handleBackPress}
          />

          <View style={styles.content}>
            <OtpInput
              value={otp}
              onChangeValue={handleOtpChange}
              errorMessage={errorMessage}
              autoFocus
            />

            <Text style={styles.helperText}>
              If you don't receive a code, check your spam folder or request a
              new one.
            </Text>

            <Pressable
              onPress={handleResend}
              disabled={loading || resendCountdown > 0}
              accessibilityRole="button"
              accessibilityState={{
                disabled: loading || resendCountdown > 0,
              }}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendText,
                  (loading || resendCountdown > 0) && styles.resendDisabled,
                ]}
              >
                {loading ? 'Sending...' : resendLabel}
              </Text>
            </Pressable>

            <AuthButton
              label="VERIFY CODE"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },

  content: {
    width: '100%',
  },

  helperText: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 20,
  },
  resendButton: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  resendText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
  resendDisabled: {
    opacity: 0.55,
  },
});
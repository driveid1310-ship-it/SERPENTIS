import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { authTheme } from '../theme/authTheme';

type OtpVerificationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'OtpVerification'
>;

export default function OtpVerificationScreen({
  navigation,
  route,
}: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { email } = route.params;

  const handleOtpChange = (value: string) => {
    setOtp(value);

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleVerify = () => {
    if (otp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);

    // UI-only for now.
    // Connect this to the backend OTP verification endpoint later.
    setTimeout(() => {
      setLoading(false);

      navigation.navigate('ResetPassword', {
        email,
      });
    }, 500);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <AuthHeader
            title="Verify Code"
            subtitle={`Enter the 6-digit code sent to ${email}`}
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
              Didn't receive the code? Check your spam folder or request a new
              code.
            </Text>

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

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: authTheme.spacing.lg,
    paddingTop: authTheme.spacing.lg,
  },

  content: {
    width: '100%',
  },

  helperText: {
    marginTop: authTheme.spacing.md,
    marginBottom: authTheme.spacing.lg,
    color: authTheme.colors.textSecondary,
    fontSize: authTheme.typography.fontSizes.sm,
    lineHeight: 20,
  },
});
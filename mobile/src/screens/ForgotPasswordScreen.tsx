import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { authTheme } from '../theme/authTheme';
import AuthHeader from '../components/AuthHeader/AuthHeader';
import AuthField from '../components/AuthField/AuthField';
import AuthButton from '../components/AuthButton/AuthButton';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSubmitPress = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Integration point: call the future "request password reset" API here
    // once the backend exposes it, then navigate on success.
    try {
      navigation.navigate('OtpVerification', { email: trimmedEmail });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, navigation]);

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
          title="Reset Password"
          subtitle="Enter your account email and we'll send a verification code."
          onBackPress={handleBackPress}
        />

        <View style={styles.card}>
          <AuthField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isSubmitting}
            errorMessage={error ?? undefined}
          />

          <AuthButton
            label="Send Code"
            onPress={handleSubmitPress}
            loading={isSubmitting}
            style={styles.submitButton}
          />

          <Text
            style={styles.backLinkText}
            onPress={isSubmitting ? undefined : handleBackPress}
            suppressHighlighting
          >
            Back to Login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: authTheme.spacing.xxl,
    paddingVertical: authTheme.spacing.xxxl,
  },
  card: {
    backgroundColor: authTheme.colors.glass,
    borderWidth: 1,
    borderColor: authTheme.colors.glassBorder,
    borderRadius: authTheme.radius.xl,
    padding: authTheme.spacing.xl,
  },
  submitButton: {
    marginTop: authTheme.spacing.sm,
    marginBottom: authTheme.spacing.lg,
  },
  backLinkText: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.accent,
    textAlign: 'center',
  },
});
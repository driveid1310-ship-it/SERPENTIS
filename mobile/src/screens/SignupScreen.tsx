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
import { useAuth } from '../hooks/useAuth';
import { authTheme } from '../theme/authTheme';
import AuthHeader from '../components/AuthHeader/AuthHeader';
import AuthField from '../components/AuthField/AuthField';
import AuthButton from '../components/AuthButton/AuthButton';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAccountPress = useCallback(async () => {
    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFullName || !trimmedEmail || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password,
      });
      navigation.navigate('Home');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create account. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [fullName, email, password, confirmPassword, register, navigation]);

  const handleLoginLinkPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

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
          title="Create Account"
          subtitle="Join the next generation of cybersecurity defense."
        />

        <View style={styles.card}>
          <AuthField
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <AuthField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!isSubmitting}
          />

          <AuthField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <AuthField
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <AuthButton
            label="Create Account"
            onPress={handleCreateAccountPress}
            loading={isSubmitting}
            style={styles.createAccountButton}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Text
              style={styles.loginLinkText}
              onPress={isSubmitting ? undefined : handleLoginLinkPress}
              suppressHighlighting
            >
              {' '}
              Log In
            </Text>
          </View>
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
  errorBanner: {
    backgroundColor: authTheme.colors.errorMuted,
    borderRadius: authTheme.radius.sm,
    paddingHorizontal: authTheme.spacing.md,
    paddingVertical: authTheme.spacing.sm,
    marginBottom: authTheme.spacing.lg,
  },
  errorBannerText: {
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.error,
  },
  createAccountButton: {
    marginBottom: authTheme.spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: authTheme.typography.fontSizes.sm,
    color: authTheme.colors.textSecondary,
  },
  loginLinkText: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.accent,
  },
});
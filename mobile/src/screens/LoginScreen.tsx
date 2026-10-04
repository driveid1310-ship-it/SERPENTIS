import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import AuthHeader from '../components/AuthHeader/AuthHeader';
import AuthField from '../components/AuthField/AuthField';
import AuthButton from '../components/AuthButton/AuthButton';
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleRememberMe = useCallback(() => {
    setRememberMe((previous) => !previous);
  }, []);

  const handleForgotPasswordPress = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const handleLoginPress = useCallback(async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: trimmedEmail, password });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to log in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [email, password, login, navigation]);

  const handleCreateAccountPress = useCallback(() => {
    navigation.navigate('Signup');
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
          title="Welcome Back"
          subtitle="Log in to report issues and stay connected to your community."
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

          <View style={styles.optionsRow}>
            <Pressable style={styles.rememberMeRow} onPress={toggleRememberMe}>
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe ? <View style={styles.checkboxDot} /> : null}
              </View>
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </Pressable>

            <Pressable onPress={handleForgotPasswordPress} hitSlop={8}>
              <Text style={styles.forgotPasswordText}>Forgot Password</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <AuthButton
            label="Log In"
            onPress={handleLoginPress}
            loading={isSubmitting}
            style={styles.loginButton}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <AuthButton
            label="Create Account"
            onPress={handleCreateAccountPress}
            variant="outline"
            disabled={isSubmitting}
          />
        </View>

        <Text style={styles.versionText}>v1.0</Text>
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
    marginBottom: theme.spacing.xxl,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    borderColor: theme.colors.primary,
  },
  checkboxDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  rememberMeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  },
  errorBanner: {
    backgroundColor: theme.colors.error + "20",
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  errorBannerText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.error,
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  versionText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
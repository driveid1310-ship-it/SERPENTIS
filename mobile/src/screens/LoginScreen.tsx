import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const COLORS = {
  background: '#050505',
  surface: '#0D0F0E',
  border: '#163A32',
  accent: '#00FFB2',
  textPrimary: '#E6FFF6',
  textSecondary: '#7C9992',
  placeholder: '#4E6560',
};

// ...existing code...
type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList & { ForgotPassword: undefined },
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(24);
  const loginButtonScale = useSharedValue(1);
  const createAccountScale = useSharedValue(1);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.exp),
    });
    containerTranslateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.exp),
    });
  }, [containerOpacity, containerTranslateY]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const loginButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginButtonScale.value }],
  }));

  const createAccountAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createAccountScale.value }],
  }));

  const handleLoginPressIn = useCallback(() => {
    loginButtonScale.value = withTiming(0.96, { duration: 100 });
  }, [loginButtonScale]);

  const handleLoginPressOut = useCallback(() => {
    loginButtonScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [loginButtonScale]);

  const handleCreateAccountPressIn = useCallback(() => {
    createAccountScale.value = withTiming(0.96, { duration: 100 });
  }, [createAccountScale]);

  const handleCreateAccountPressOut = useCallback(() => {
    createAccountScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [createAccountScale]);

  const handleLoginPress = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleCreateAccountPress = useCallback(() => {
    navigation.navigate('Signup');
  }, [navigation]);

  const handleForgotPasswordPress = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previous) => !previous);
  }, []);

  const toggleRememberMe = useCallback(() => {
    setRememberMe((previous) => !previous);
  }, []);

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
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.logoText}>SERPENTIS</Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>
              Secure access to your cybersecurity workspace.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.placeholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={togglePasswordVisibility} hitSlop={8}>
                  <Text style={styles.toggleVisibilityText}>
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>

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
          </View>

          <Animated.View style={loginButtonAnimatedStyle}>
            <Pressable
              style={styles.loginButton}
              onPress={handleLoginPress}
              onPressIn={handleLoginPressIn}
              onPressOut={handleLoginPressOut}
            >
              <Text style={styles.loginButtonText}>LOGIN</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Animated.View style={createAccountAnimatedStyle}>
            <Pressable
              style={styles.createAccountButton}
              onPress={handleCreateAccountPress}
              onPressIn={handleCreateAccountPressIn}
              onPressOut={handleCreateAccountPressOut}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </Pressable>
          </Animated.View>

          <Text style={styles.versionText}>v1.0</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  container: {
    width: '100%',
  },
  header: {
    marginBottom: 36,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    color: COLORS.accent,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  form: {
    marginBottom: 28,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  toggleVisibilityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: COLORS.accent,
    paddingLeft: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: COLORS.accent,
  },
  checkboxDot: {
    width: 9,
    height: 9,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  rememberMeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },
  loginButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.background,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  createAccountButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  createAccountButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.textPrimary,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
});
// ...existing code...
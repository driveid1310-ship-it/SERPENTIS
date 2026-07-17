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
type SignupScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

interface SignupScreenProps {
  navigation: SignupScreenNavigationProp;
}

export default function SignupScreen({ navigation }: SignupScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(24);
  const createAccountScale = useSharedValue(1);
  const loginLinkScale = useSharedValue(1);

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

  const createAccountAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: createAccountScale.value }],
  }));

  const loginLinkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginLinkScale.value }],
  }));

  const handleCreateAccountPressIn = useCallback(() => {
    createAccountScale.value = withTiming(0.96, { duration: 100 });
  }, [createAccountScale]);

  const handleCreateAccountPressOut = useCallback(() => {
    createAccountScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [createAccountScale]);

  const handleLoginLinkPressIn = useCallback(() => {
    loginLinkScale.value = withTiming(0.96, { duration: 100 });
  }, [loginLinkScale]);

  const handleLoginLinkPressOut = useCallback(() => {
    loginLinkScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [loginLinkScale]);

  const handleCreateAccountPress = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const handleLoginLinkPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previous) => !previous);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setIsConfirmPasswordVisible((previous) => !previous);
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
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Join the next generation of cybersecurity defense.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="John Doe"
                placeholderTextColor={COLORS.placeholder}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={toggleConfirmPasswordVisibility} hitSlop={8}>
                  <Text style={styles.toggleVisibilityText}>
                    {isConfirmPasswordVisible ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
            </View>
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

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Animated.View style={loginLinkAnimatedStyle}>
              <Pressable
                onPress={handleLoginLinkPress}
                onPressIn={handleLoginLinkPressIn}
                onPressOut={handleLoginLinkPressOut}
                hitSlop={8}
              >
                <Text style={styles.loginLinkText}>Log In</Text>
              </Pressable>
            </Animated.View>
          </View>
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
    marginBottom: 32,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 4,
    color: COLORS.accent,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 26,
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
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
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
  createAccountButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  createAccountButtonText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.background,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  loginLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    marginLeft: 6,
  },
});
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
type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ForgotPasswordScreenProps {
  navigation: ForgotPasswordScreenNavigationProp;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');

  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(24);
  const submitButtonScale = useSharedValue(1);
  const backLinkScale = useSharedValue(1);

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

  const submitButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
  }));

  const backLinkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backLinkScale.value }],
  }));

  const handleSubmitPressIn = useCallback(() => {
    submitButtonScale.value = withTiming(0.96, { duration: 100 });
  }, [submitButtonScale]);

  const handleSubmitPressOut = useCallback(() => {
    submitButtonScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [submitButtonScale]);

  const handleBackLinkPressIn = useCallback(() => {
    backLinkScale.value = withTiming(0.96, { duration: 100 });
  }, [backLinkScale]);

  const handleBackLinkPressOut = useCallback(() => {
    backLinkScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [backLinkScale]);

  const handleSubmitPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const handleBackToLoginPress = useCallback(() => {
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
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
          <View style={styles.header}>
            <Text style={styles.logoText}>SERPENTIS</Text>
            <Text style={styles.welcomeText}>Reset Password</Text>
            <Text style={styles.subtitleText}>
              Enter your email and we will send you a secure reset link.
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
          </View>

          <Animated.View style={submitButtonAnimatedStyle}>
            <Pressable
              style={styles.submitButton}
              onPress={handleSubmitPress}
              onPressIn={handleSubmitPressIn}
              onPressOut={handleSubmitPressOut}
            >
              <Text style={styles.submitButtonText}>SEND RESET LINK</Text>
            </Pressable>
          </Animated.View>

          <Animated.View style={backLinkAnimatedStyle}>
            <Pressable
              style={styles.backLinkButton}
              onPress={handleBackToLoginPress}
              onPressIn={handleBackLinkPressIn}
              onPressOut={handleBackLinkPressOut}
            >
              <Text style={styles.backLinkText}>Back to Login</Text>
            </Pressable>
          </Animated.View>
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
  submitButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.background,
  },
  backLinkButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
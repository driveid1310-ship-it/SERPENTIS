import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { authTheme } from '../theme/authTheme';

export default function SplashScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isAuthenticated, loading } = useAuth();

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(16);
  const glowIntensity = useSharedValue(0.3);
  const subtitleOpacity = useSharedValue(0);
  const frameOpacity = useSharedValue(0);

  const dotOpacity0 = useSharedValue(0.3);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacities = useMemo(
    () => [dotOpacity0, dotOpacity1, dotOpacity2],
    [dotOpacity0, dotOpacity1, dotOpacity2],
  );

  const [minDurationElapsed, setMinDurationElapsed] = useState(false);

  useEffect(() => {
    titleOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    titleTranslateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    frameOpacity.value = withDelay(
      150,
      withTiming(1, { duration: 700, easing: Easing.out(Easing.exp) }),
    );

    glowIntensity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.35, {
            duration: 1400,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );

    subtitleOpacity.value = withDelay(
      500,
      withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.ease),
      }),
    );

    dotOpacities.forEach((dot, index) => {
      dot.value = withDelay(
        index * 180,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 450,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(0.25, {
              duration: 450,
              easing: Easing.inOut(Easing.ease),
            }),
          ),
          -1,
          true,
        ),
      );
    });

    const timer = setTimeout(() => {
      setMinDurationElapsed(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    titleOpacity,
    titleTranslateY,
    glowIntensity,
    subtitleOpacity,
    frameOpacity,
    dotOpacities,
  ]);

  // Wait for the animation's minimum duration AND the real session
  // restoration (AuthContext validating any stored token) to finish
  // before deciding where to go. This avoids forcing an already-logged-in
  // user back to Login on every launch, and avoids racing a slow /auth/me
  // call by navigating before we actually know the auth state.
  useEffect(() => {
    if (!minDurationElapsed || loading) {
      return;
    }

    navigation.replace(isAuthenticated ? 'Home' : 'Login');
  }, [minDurationElapsed, loading, isAuthenticated, navigation]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
  }));

  const frameAnimatedStyle = useAnimatedStyle(() => ({
    opacity: frameOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const dotAnimatedStyle0 = useAnimatedStyle(() => ({
    opacity: dotOpacities[0].value,
  }));

  const dotAnimatedStyle1 = useAnimatedStyle(() => ({
    opacity: dotOpacities[1].value,
  }));

  const dotAnimatedStyle2 = useAnimatedStyle(() => ({
    opacity: dotOpacities[2].value,
  }));

  const dotStyles = [dotAnimatedStyle0, dotAnimatedStyle1, dotAnimatedStyle2];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={authTheme.colors.background}
      />

      <View style={styles.centerContent}>
        <View style={styles.titleWrapper}>
          <Animated.View
            style={[styles.cornerBrackets, frameAnimatedStyle]}
            pointerEvents="none"
          >
            <View style={[styles.bracket, styles.bracketTopLeft]} />
            <View style={[styles.bracket, styles.bracketTopRight]} />
            <View style={[styles.bracket, styles.bracketBottomLeft]} />
            <View style={[styles.bracket, styles.bracketBottomRight]} />
          </Animated.View>

          <Animated.View style={[styles.glowLayer, glowAnimatedStyle]}>
            <Text style={styles.titleGlowText}>SERPENTIS</Text>
          </Animated.View>

          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.titleText}>SERPENTIS</Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.subtitleText, subtitleAnimatedStyle]}>
          Community-Powered Civic Reporting
        </Animated.Text>
      </View>

      <View style={styles.loaderContainer}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={`splash-dot-${index}`}
              style={[
                styles.dot,
                index < 2 ? styles.dotSpacing : null,
                dotStyles[index],
              ]}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const BRACKET_SIZE = 18;
const BRACKET_THICKNESS = 2;
const BRACKET_INSET = -28;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: authTheme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBrackets: {
    position: 'absolute',
    top: BRACKET_INSET,
    bottom: BRACKET_INSET,
    left: BRACKET_INSET,
    right: BRACKET_INSET,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    borderColor: authTheme.colors.accent,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderLeftWidth: BRACKET_THICKNESS,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BRACKET_THICKNESS,
    borderRightWidth: BRACKET_THICKNESS,
  },
  glowLayer: {
    position: 'absolute',
  },
  titleGlowText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: authTheme.colors.accent,
    textShadowColor: authTheme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: authTheme.colors.textPrimary,
    textShadowColor: authTheme.colors.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitleText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    color: authTheme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: authTheme.colors.accent,
  },
  dotSpacing: {
    marginRight: 10,
  },
});
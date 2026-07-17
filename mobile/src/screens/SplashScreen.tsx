import React, { useEffect, useMemo } from 'react';
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

const COLORS = {
  background: '#050505',
  primaryGlow: '#00FFB2',
  secondaryText: '#7CFFDB',
  subtitleText: '#8A9A97',
  dotIdle: '#0F3D33',
};

export default function SplashScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(16);
  const glowIntensity = useSharedValue(0.3);
  const subtitleOpacity = useSharedValue(0);

  const dotOpacity0 = useSharedValue(0.3);
  const dotOpacity1 = useSharedValue(0.3);
  const dotOpacity2 = useSharedValue(0.3);
  const dotOpacities = useMemo(
    () => [dotOpacity0, dotOpacity1, dotOpacity2],
    [dotOpacity0, dotOpacity1, dotOpacity2],
  );

  useEffect(() => {
    titleOpacity.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

    titleTranslateY.value = withTiming(0, {
      duration: 900,
      easing: Easing.out(Easing.exp),
    });

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
      navigation.replace('Login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [
    navigation,
    titleOpacity,
    titleTranslateY,
    glowIntensity,
    subtitleOpacity,
    dotOpacities,
  ]);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.centerContent}>
        <View style={styles.titleWrapper}>
          <Animated.View style={[styles.glowLayer, glowAnimatedStyle]}>
            <Text style={styles.titleGlowText}>SERPENTIS</Text>
          </Animated.View>

          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.titleText}>SERPENTIS</Text>
          </Animated.View>
        </View>

        <Animated.Text style={[styles.subtitleText, subtitleAnimatedStyle]}>
          AI Powered Cybersecurity Platform
        </Animated.Text>
      </View>

      <View style={styles.loaderContainer}>
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(index => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  glowLayer: {
    position: 'absolute',
  },
  titleGlowText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: COLORS.primaryGlow,
    textShadowColor: COLORS.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  titleText: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    color: COLORS.secondaryText,
    textShadowColor: COLORS.primaryGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitleText: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    color: COLORS.subtitleText,
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
    backgroundColor: COLORS.primaryGlow,
  },
  dotSpacing: {
    marginRight: 10,
  },
});
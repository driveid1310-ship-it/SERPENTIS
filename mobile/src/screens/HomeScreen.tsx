import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
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
  danger: '#FF5C5C',
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface FeatureCardConfig {
  key: string;
  title: string;
  description: string;
  badge: string;
}

const FEATURE_CARDS: FeatureCardConfig[] = [
  {
    key: 'ai-assistant',
    title: 'AI Assistant',
    description: 'Chat with your intelligent security analyst.',
    badge: 'AI',
  },
  {
    key: 'url-scanner',
    title: 'URL Scanner',
    description: 'Detect phishing and malicious links instantly.',
    badge: 'SCAN',
  },
  {
    key: 'file-scanner',
    title: 'File Scanner',
    description: 'Analyze files for malware and vulnerabilities.',
    badge: 'SCAN',
  },
  {
    key: 'threat-feed',
    title: 'Threat Feed',
    description: 'Live global cybersecurity threat intelligence.',
    badge: 'LIVE',
  },
];

interface FeatureCardProps {
  config: FeatureCardConfig;
  index: number;
}

function FeatureCard({ config, index }: FeatureCardProps) {
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const cardScale = useSharedValue(1);

  useEffect(() => {
    cardOpacity.value = withDelay(
      120 * index,
      withTiming(1, { duration: 500, easing: Easing.out(Easing.exp) }),
    );
    cardTranslateY.value = withDelay(
      120 * index,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.exp) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
    ],
  }));

  const handlePressIn = useCallback(() => {
    cardScale.value = withTiming(0.97, { duration: 100 });
  }, [cardScale]);

  const handlePressOut = useCallback(() => {
    cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
  }, [cardScale]);

  return (
    <Animated.View style={[styles.cardWrapper, cardAnimatedStyle]}>
      <Pressable
        style={styles.card}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{config.title}</Text>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{config.badge}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{config.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const bannerOpacity = useSharedValue(0);
  const bannerTranslateY = useSharedValue(-16);
  const logoutButtonScale = useSharedValue(1);

  useEffect(() => {
    bannerOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
    bannerTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    });
  }, [bannerOpacity, bannerTranslateY]);

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ translateY: bannerTranslateY.value }],
  }));

  const logoutButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoutButtonScale.value }],
  }));

  const handleLogoutPressIn = useCallback(() => {
    logoutButtonScale.value = withTiming(0.96, { duration: 100 });
  }, [logoutButtonScale]);

  const handleLogoutPressOut = useCallback(() => {
    logoutButtonScale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [logoutButtonScale]);

  const handleLogoutPress = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={[styles.flex, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.banner, bannerAnimatedStyle]}>
          <Text style={styles.bannerEyebrow}>SERPENTIS</Text>
          <Text style={styles.bannerTitle}>Welcome back, operator.</Text>
          <Text style={styles.bannerSubtitle}>
            Your systems are being monitored in real time.
          </Text>
        </Animated.View>

        <View style={styles.cardsGrid}>
          {FEATURE_CARDS.map((config, index) => (
            <FeatureCard key={config.key} config={config} index={index} />
          ))}
        </View>

        <Animated.View style={logoutButtonAnimatedStyle}>
          <Pressable
            style={styles.logoutButton}
            onPress={handleLogoutPress}
            onPressIn={handleLogoutPressIn}
            onPressOut={handleLogoutPressOut}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 24,
  },
  bannerEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: COLORS.accent,
    marginBottom: 10,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  cardsGrid: {
    marginBottom: 28,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardBadge: {
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: COLORS.accent,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: COLORS.danger,
  },
});

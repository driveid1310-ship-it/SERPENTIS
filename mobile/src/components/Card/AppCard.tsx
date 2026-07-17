import React, { useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export type AppCardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface AppCardProps {
  children: React.ReactNode;
  elevation?: AppCardElevation;
  padded?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppCard({
  children,
  elevation = 'sm',
  padded = true,
  onPress,
  style,
  testID,
}: AppCardProps) {
  const scale = useSharedValue(1);
  const isPressable = typeof onPress === 'function';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!isPressable) {
      return;
    }
    scale.value = withTiming(0.98, { duration: 100 });
  }, [isPressable, scale]);

  const handlePressOut = useCallback(() => {
    if (!isPressable) {
      return;
    }
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  }, [isPressable, scale]);

  const elevationStyle =
    elevation === 'none'
      ? undefined
      : elevation === 'md'
        ? theme.shadows.md
        : elevation === 'lg'
          ? theme.shadows.lg
          : theme.shadows.sm;

  const cardStyle: StyleProp<ViewStyle>[] = [
    styles.base,
    padded && styles.padded,
    elevationStyle,
    style,
  ];

  if (isPressable) {
    return (
      <AnimatedPressable
        testID={testID}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[cardStyle, animatedStyle]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View testID={testID} style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
  },
  padded: {
    padding: theme.spacing.lg,
  },
});
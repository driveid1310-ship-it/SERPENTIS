import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../../theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
  testID,
}: AppButtonProps) {
  const scale = useSharedValue(1);
  const isInteractionDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isInteractionDisabled) {
      return;
    }
    scale.value = withTiming(0.97, { duration: 90 });
  }, [isInteractionDisabled, scale]);

  const handlePressOut = useCallback(() => {
    if (isInteractionDisabled) {
      return;
    }
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  }, [isInteractionDisabled, scale]);

  const handlePress = useCallback(() => {
    if (isInteractionDisabled) {
      return;
    }
    onPress();
  }, [isInteractionDisabled, onPress]);

  const containerStyle: StyleProp<ViewStyle>[] = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    fullWidth && styles.fullWidth,
    isInteractionDisabled && styles.disabled,
    style,
  ];

  const labelStyle: StyleProp<TextStyle>[] = [
    styles.labelBase,
    variant === 'primary' && styles.labelPrimary,
    variant === 'secondary' && styles.labelSecondary,
    variant === 'outline' && styles.labelOutline,
    isInteractionDisabled && styles.labelDisabled,
    textStyle,
  ];

  const indicatorColor =
    variant === 'primary' ? theme.colors.background : theme.colors.accent;

  return (
    <AnimatedPressable
      testID={testID}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isInteractionDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      style={[containerStyle, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text style={labelStyle} numberOfLines={1}>
            {label}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  labelBase: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 1,
  },
  labelPrimary: {
    color: theme.colors.background,
  },
  labelSecondary: {
    color: theme.colors.textPrimary,
  },
  labelOutline: {
    color: theme.colors.accent,
  },
  labelDisabled: {
    opacity: 0.9,
  },
});
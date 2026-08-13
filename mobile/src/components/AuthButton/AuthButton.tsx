import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import authTheme from '../../theme/authTheme';

export type AuthButtonVariant = 'primary' | 'outline';

export interface AuthButtonProps
  extends Omit<PressableProps, 'onPress' | 'children'> {
  label: string;
  onPress: () => void;
  variant?: AuthButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function AuthButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  ...pressableProps
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = useCallback(() => {
    if (isDisabled) {
      return;
    }

    onPress();
  }, [isDisabled, onPress]);

  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.outline,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? authTheme.colors.background
              : authTheme.colors.accent
          }
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'primary'
              ? styles.primaryLabel
              : styles.outlineLabel,
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 56,
    borderRadius: authTheme.radius.md,
    paddingHorizontal: authTheme.spacing.lg,
    paddingVertical: authTheme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primary: {
    backgroundColor: authTheme.colors.accent,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  label: {
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.bold,
    letterSpacing: 0.4,
  },

  primaryLabel: {
    color: authTheme.colors.background,
  },

  outlineLabel: {
    color: authTheme.colors.textPrimary,
  },

  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  disabled: {
    opacity: 0.45,
  },
});
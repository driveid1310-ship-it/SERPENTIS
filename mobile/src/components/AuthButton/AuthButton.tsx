import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

const AuthButton = ({ label, onPress, loading, disabled, variant = 'primary', style }: AuthButtonProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const getContainerStyle = () => {
    switch (variant) {
      case 'primary': return styles.primary;
      case 'secondary': return styles.secondary;
      case 'outline': return styles.outline;
    }
  };

  const getLabelStyle = () => {
    switch (variant) {
      case 'primary': return styles.labelPrimary;
      case 'secondary': return styles.labelSecondary;
      case 'outline': return styles.labelOutline;
    }
  };

  const indicatorColor = variant === 'primary' ? theme.colors.background : theme.colors.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        getContainerStyle(),
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && { opacity: 0.8 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={indicatorColor} />
      ) : (
        <Text style={[styles.labelBase, getLabelStyle()]}>{label}</Text>
      )}
    </Pressable>
  );
};

export default AuthButton;

const getStyles = (theme: any) => StyleSheet.create({
  base: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  primary: { backgroundColor: theme.colors.primary },
  secondary: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
  disabled: { opacity: 0.5 },
  labelBase: { fontSize: theme.typography.fontSizes.md, fontWeight: theme.typography.fontWeights.bold, letterSpacing: 1 },
  labelPrimary: { color: theme.colors.background },
  labelSecondary: { color: theme.colors.text },
  labelOutline: { color: theme.colors.primary },
});
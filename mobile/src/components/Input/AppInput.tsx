import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      errorMessage,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      style,
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const displayError = error || errorMessage;

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputContainer, displayError ? styles.inputError : undefined]}>
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={theme.colors.textTertiary}
            {...rest}
          />
          {rightIcon ? (
            <Pressable onPress={onRightIconPress} style={styles.rightIconContainer} disabled={!onRightIconPress}>
              {rightIcon}
            </Pressable>
          ) : null}
        </View>
        {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
      </View>
    );
  }
);
AppInput.displayName = 'AppInput';
export default AppInput;

const getStyles = (theme: any) => StyleSheet.create({
  container: { width: '100%', marginBottom: theme.spacing.md },
  label: { fontSize: theme.typography.caption, fontWeight: theme.typography.fontWeights.medium as any, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, minHeight: 48 },
  inputError: { borderColor: theme.colors.error },
  input: { flex: 1, paddingHorizontal: theme.spacing.md, color: theme.colors.text, fontSize: theme.typography.body, height: '100%' },
  leftIconContainer: { paddingLeft: theme.spacing.md },
  rightIconContainer: { paddingRight: theme.spacing.md },
  errorText: { color: theme.colors.error, fontSize: theme.typography.caption, marginTop: theme.spacing.xs },
});
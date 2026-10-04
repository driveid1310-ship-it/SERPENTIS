import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Text, Pressable, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface AuthFieldProps extends TextInputProps {
  label: string;
  error?: string;
  errorMessage?: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const AuthField = forwardRef<TextInput, AuthFieldProps>(
  (
    {
      label,
      error,
      errorMessage,
      isPassword,
      rightIcon,
      onRightIconPress,
      style,
      ...rest
    },
    ref
  ) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const displayError = error || errorMessage;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputContainer, displayError ? styles.inputError : undefined]}>
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry={isPassword}
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
AuthField.displayName = 'AuthField';
export default AuthField;

const getStyles = (theme: any) => StyleSheet.create({
  container: { width: '100%', marginBottom: theme.spacing.md },
  label: { fontSize: theme.typography.caption, fontWeight: theme.typography.fontWeights.medium as any, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, minHeight: 48 },
  inputError: { borderColor: theme.colors.error },
  input: { flex: 1, paddingHorizontal: theme.spacing.md, color: theme.colors.text, fontSize: theme.typography.body, height: '100%' },
  rightIconContainer: { paddingRight: theme.spacing.md },
  errorText: { color: theme.colors.error, fontSize: theme.typography.caption, marginTop: theme.spacing.xs },
});

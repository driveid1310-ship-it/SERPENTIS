import React, { forwardRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { authTheme } from '../../theme/authTheme';

export interface AuthFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  errorMessage?: string;
  isPassword?: boolean;
  editable?: boolean;
}

const AuthField = forwardRef<TextInput, AuthFieldProps>(function InnerAuthField(
  {
    label,
    errorMessage,
    isPassword = false,
    editable = true,
    secureTextEntry,
    onFocus,
    onBlur,
    ...restProps
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(errorMessage);

  const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
    (event) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
    (event) => {
      setIsFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((previous) => !previous);
  }, []);

  const resolvedSecureTextEntry = isPassword
    ? !isPasswordVisible
    : secureTextEntry;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          hasError && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={authTheme.colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={resolvedSecureTextEntry}
          editable={editable}
          {...restProps}
        />

        {isPassword ? (
          <Pressable onPress={togglePasswordVisibility} hitSlop={10}>
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {hasError ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
});

export default AuthField;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: authTheme.spacing.lg,
  },
  label: {
    fontSize: authTheme.typography.fontSizes.xs,
    fontWeight: authTheme.typography.fontWeights.semibold,
    letterSpacing: 1.2,
    color: authTheme.colors.textSecondary,
    marginBottom: authTheme.spacing.sm,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
    borderRadius: authTheme.radius.md,
    paddingHorizontal: authTheme.spacing.lg,
  },
  inputRowFocused: {
    borderColor: authTheme.colors.accent,
  },
  inputRowError: {
    borderColor: authTheme.colors.error,
  },
  inputRowDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: authTheme.spacing.lg,
    fontSize: authTheme.typography.fontSizes.md,
    color: authTheme.colors.textPrimary,
  },
  toggleText: {
    fontSize: authTheme.typography.fontSizes.xs,
    fontWeight: authTheme.typography.fontWeights.bold,
    letterSpacing: 1,
    color: authTheme.colors.accent,
    paddingLeft: authTheme.spacing.md,
  },
  errorText: {
    marginTop: authTheme.spacing.xs,
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.error,
  },
});

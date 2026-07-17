import React, { useCallback, useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import theme from '../../theme';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  errorMessage?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  {
    label,
    errorMessage,
    leftIcon,
    rightIcon,
    isPassword = false,
    containerStyle,
    onFocus,
    onBlur,
    secureTextEntry,
    editable = true,
    ...restProps
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = Boolean(errorMessage);

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
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
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputRowFocused,
          hasError && styles.inputRowError,
          !editable && styles.inputRowDisabled,
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={resolvedSecureTextEntry}
          editable={editable}
          {...restProps}
        />

        {isPassword ? (
          <Pressable onPress={togglePasswordVisibility} hitSlop={8}>
            <Text style={styles.toggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {hasError ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
});

export default AppInput;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputRowFocused: {
    borderColor: theme.colors.accent,
  },
  inputRowError: {
    borderColor: theme.colors.danger,
  },
  inputRowDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textPrimary,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  toggleText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.accent,
    paddingLeft: theme.spacing.sm,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.danger,
  },
});
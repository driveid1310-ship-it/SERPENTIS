import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { authTheme } from '../../theme/authTheme';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChangeValue: (value: string) => void;
  errorMessage?: string;
  autoFocus?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChangeValue,
  errorMessage,
  autoFocus = true,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const hasError = Boolean(errorMessage);

  const handleChangeText = useCallback(
    (text: string) => {
      const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, length);
      onChangeValue(digitsOnly);
    },
    [length, onChangeValue],
  );

  const cells = Array.from(
    { length },
    (_, index) => value[index] ?? '',
  );

  return (
    <View>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Enter verification code"
        style={styles.wrapper}
      >
        <View style={styles.cellsRow} pointerEvents="none">
          {cells.map((digit, index) => {
            const isActiveCell =
              isFocused && index === value.length;

            return (
              <View
                key={`otp-cell-${index}`}
                style={[
                  styles.cell,
                  isActiveCell && styles.cellActive,
                  hasError && styles.cellError,
                ]}
              >
                <Text style={styles.cellText}>{digit}</Text>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          style={styles.hiddenInput}
          caretHidden
        />
      </Pressable>

      {hasError ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },

  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cell: {
    width: 48,
    height: 56,
    borderRadius: authTheme.radius.md,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
    backgroundColor: authTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cellActive: {
    borderColor: authTheme.colors.accent,
  },

  cellError: {
    borderColor: authTheme.colors.error,
  },

  cellText: {
    fontSize: authTheme.typography.fontSizes.xl,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },

  errorText: {
    marginTop: authTheme.spacing.sm,
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.error,
  },
});
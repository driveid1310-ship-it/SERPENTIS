import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange?: (value: string) => void;
  onChangeValue?: (value: string) => void;
  error?: string;
  errorMessage?: string;
  autoFocus?: boolean;
}

const OtpInput = ({ length = 6, value, onChange, onChangeValue, error, errorMessage, autoFocus }: OtpInputProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const displayError = error || errorMessage;
  
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleTextChange = (text: string, index: number) => {
    const newValue = value.split('');
    newValue[index] = text;
    const finalValue = newValue.join('').substring(0, length);
    if (onChange) onChange(finalValue);
    if (onChangeValue) onChangeValue(finalValue);

    if (text && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      const newValue = value.split('');
      newValue[index - 1] = '';
      if (onChange) onChange(newValue.join(''));
      if (onChangeValue) onChangeValue(newValue.join(''));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputsContainer}>
        {Array(length)
          .fill(0)
          .map((_, index) => (
            <TextInput
              key={index}
              ref={ref => { inputs.current[index] = ref; }}
              style={[
                styles.input,
                focusedIndex === index && styles.inputFocused,
                displayError && styles.inputError,
              ]}
              maxLength={1}
              keyboardType="number-pad"
              value={value[index] || ''}
              onChangeText={text => handleTextChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              selectTextOnFocus
              autoFocus={autoFocus && index === 0}
            />
          ))}
      </View>
      {displayError ? <Text style={styles.errorText}>{displayError}</Text> : null}
    </View>
  );
};
export default OtpInput;

const getStyles = (theme: any) => StyleSheet.create({
  container: { width: '100%', marginBottom: theme.spacing.md },
  inputsContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.spacing.sm },
  input: { flex: 1, aspectRatio: 1, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, textAlign: 'center', fontSize: theme.typography.h2, fontWeight: theme.typography.fontWeights.bold as any, color: theme.colors.text },
  inputFocused: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  inputError: { borderColor: theme.colors.error },
  errorText: { color: theme.colors.error, fontSize: theme.typography.caption, marginTop: theme.spacing.xs, textAlign: 'center' },
});
import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export default function Screen({ children, scrollable = false, keyboardAvoiding = true, contentContainerStyle, style }: ScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const content = scrollable ? (
    <ScrollView contentContainerStyle={[styles.scrollContent, contentContainerStyle]} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  keyboardView: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
});
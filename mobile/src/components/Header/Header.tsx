import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  rightSlot?: React.ReactNode;
}

export default function Header({ title, subtitle, onBackPress, rightSlot }: HeaderProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.leftAction}>
        {onBackPress && (
          <Pressable onPress={onBackPress} hitSlop={10}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightAction}>
        {rightSlot}
      </View>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.background, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  leftAction: { minWidth: 40, alignItems: 'flex-start' },
  rightAction: { minWidth: 40, alignItems: 'flex-end' },
  titleContainer: { flex: 1, alignItems: 'center' },
  title: { fontSize: theme.typography.h3, fontWeight: 'bold' as any, color: theme.colors.text, textAlign: 'center' },
  subtitle: { fontSize: theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 2 },
  backButtonText: { fontSize: theme.typography.h2, color: theme.colors.text },
});
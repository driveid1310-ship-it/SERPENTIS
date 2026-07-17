import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '../../theme';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
  backIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export default function Header({
  title,
  subtitle,
  onBackPress,
  backIcon,
  rightAction,
  style,
  testID,
}: HeaderProps) {
  const hasBackButton = typeof onBackPress === 'function';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.sideSlot}>
        {hasBackButton ? (
          <Pressable
            onPress={onBackPress}
            hitSlop={12}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            {backIcon ?? <Text style={styles.backIconFallback}>{'‹'}</Text>}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.sideSlot, styles.rightSlot]}>
        {rightAction ?? null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  sideSlot: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconFallback: {
    fontSize: 28,
    lineHeight: 28,
    color: theme.colors.accent,
    fontWeight: theme.typography.fontWeights.bold,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 2,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
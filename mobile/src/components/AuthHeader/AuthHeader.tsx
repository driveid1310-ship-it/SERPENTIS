import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { authTheme } from '../../theme/authTheme';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  onBackPress?: () => void;
}

export default function AuthHeader({
  title,
  subtitle,
  onBackPress,
}: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      {onBackPress ? (
        <Pressable
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: authTheme.spacing.xl,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: authTheme.spacing.lg,
    paddingVertical: authTheme.spacing.xs,
  },

  backButtonPressed: {
    opacity: 0.6,
  },

  backIcon: {
    marginRight: 6,
    color: authTheme.colors.textPrimary,
    fontSize: 30,
    lineHeight: 30,
  },

  backText: {
    color: authTheme.colors.textSecondary,
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.medium,
  },

  title: {
    color: authTheme.colors.textPrimary,
    fontSize: authTheme.typography.h1,
    fontWeight: authTheme.typography.fontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: authTheme.spacing.sm,
    color: authTheme.colors.textSecondary,
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.regular,
    lineHeight: 24,
  },
});
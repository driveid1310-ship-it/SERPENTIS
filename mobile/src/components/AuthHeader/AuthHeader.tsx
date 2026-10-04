import React from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';

import { useTheme } from '../../context/ThemeContext';

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
  const { theme } = useTheme();
  const styles = getStyles(theme);
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

      
      <View style={styles.brandingContainer}>
        <Image 
          source={require('../../assets/images/serpentis-logo-transparent.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        <Text style={styles.brandName}>SERPENTIS</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  brandingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 24,
    height: 24,
    tintColor: theme.colors.text,
    marginRight: 8,
  },
  brandName: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 2,
    color: theme.colors.text,
  },
  container: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },

  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },

  backButtonPressed: {
    opacity: 0.6,
  },

  backIcon: {
    marginRight: 6,
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 30,
  },

  backText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },

  title: {
    color: theme.colors.text,
    fontSize: theme.typography.h1,
    fontWeight: theme.typography.fontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  subtitle: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.regular,
    lineHeight: 24,
  },
});
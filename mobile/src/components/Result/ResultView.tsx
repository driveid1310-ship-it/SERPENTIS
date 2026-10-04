import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import AppButton from '../Button/AppButton';
import { useTheme } from '../../context/ThemeContext';

export interface ResultViewProps {
  status: 'success' | 'failure' | 'loading';
  title: string;
  description: string;
  referenceId?: string;
  icon?: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

export default function ResultView({
  status,
  title,
  description,
  referenceId,
  icon,
  primaryAction,
  secondaryAction,
}: ResultViewProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const defaultIcon = status === 'success' ? '✓' : status === 'failure' ? '!' : '...';
  const displayIcon = icon || defaultIcon;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={[styles.iconText, status === 'failure' && styles.iconFailure]}>
            {displayIcon}
          </Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        {referenceId && (
          <View style={styles.referenceContainer}>
            <Text style={styles.referenceLabel}>ID: </Text>
            <Text style={styles.referenceValue}>{referenceId}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {primaryAction && (
          <AppButton
            label={primaryAction.label}
            onPress={primaryAction.onPress}
            variant="primary"
            style={styles.button}
          />
        )}
        {secondaryAction && (
          <AppButton
            label={secondaryAction.label}
            onPress={secondaryAction.onPress}
            variant="outline"
            style={styles.button}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    padding: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  iconText: {
    fontSize: 40,
    color: theme.colors.primary,
    fontWeight: '300',
  },
  iconFailure: {
    color: theme.colors.error,
  },
  title: {
    fontSize: theme.typography.h1,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  description: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  referenceContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  referenceLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSizes.sm,
  },
  referenceValue: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  button: {
    width: '100%',
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface MiniBarItem {
  label: string;
  value: number | null;
  color?: string;
}

interface MiniBarChartProps {
  title: string;
  unit: string;
  items: MiniBarItem[];
  emptyMessage?: string;
}

export default function MiniBarChart({
  title,
  unit,
  items,
  emptyMessage = 'No data available for chart.',
}: MiniBarChartProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const validValues = items
    .map((i) => i.value)
    .filter((v): v is number => v !== null && Number.isFinite(v));

  if (validValues.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const maxVal = Math.max(...validValues, 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.unitLabel}>{unit}</Text>
      </View>
      <View style={styles.barsRow}>
        {items.map((item, index) => {
          const v = item.value;
          const heightPct =
            v !== null && Number.isFinite(v)
              ? Math.max(8, Math.round((Math.max(0, v) / maxVal) * 100))
              : 0;
          return (
            <View key={`${item.label}-${index}`} style={styles.barCol}>
              <Text style={styles.valueLabel}>
                {v !== null && Number.isFinite(v) ? Math.round(v) : '—'}
              </Text>
              <View style={styles.barTrack}>
                {v !== null ? (
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: item.color || theme.colors.primary,
                      },
                    ]}
                  />
                ) : null}
              </View>
              <Text style={styles.axisLabel} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    unitLabel: {
      fontSize: theme.typography.fontSizes.xs,
      color: theme.colors.textSecondary,
    },
    emptyText: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.textSecondary,
      paddingVertical: theme.spacing.md,
    },
    barsRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: 110,
      gap: 4,
    },
    barCol: {
      flex: 1,
      alignItems: 'center',
      height: '100%',
      justifyContent: 'flex-end',
    },
    valueLabel: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    barTrack: {
      width: '70%',
      height: 68,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    barFill: {
      width: '100%',
      borderRadius: 4,
    },
    axisLabel: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      marginTop: 4,
    },
  });

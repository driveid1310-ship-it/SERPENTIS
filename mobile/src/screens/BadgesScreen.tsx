import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { useTheme } from '../context/ThemeContext';
import { getMyBadgesRequest } from '../api/users';

type Props = NativeStackScreenProps<RootStackParamList, 'Badges'>;

export default function BadgesScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    getMyBadgesRequest()
      .then((res) => {
        if (isActive) {
          if (res.success && 'data' in res) {
            setBadges(res.data.badges);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Screen keyboardAvoiding={false}>
      <Header title="Medals & Badges" subtitle="Your civic achievements" onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {badges.map((badge) => (
              <AppCard key={badge.id} style={[styles.card, !badge.earned && styles.cardLocked]}>
                <View style={[styles.iconContainer, !badge.earned && styles.iconLocked]}>
                  <Text style={styles.icon}>{badge.icon}</Text>
                </View>
                <Text style={[styles.name, !badge.earned && styles.textLocked]}>{badge.name}</Text>
                <Text style={styles.description}>{badge.description}</Text>
                <View style={styles.reqContainer}>
                  <Text style={styles.reqText}>
                    {badge.earned ? '✓ Earned' : `🔒 ${badge.requirement}`}
                  </Text>
                </View>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  content: {
    padding: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  cardLocked: {
    opacity: 0.6,
    backgroundColor: theme.colors.surface,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconLocked: {
    backgroundColor: theme.colors.border,
  },
  icon: {
    fontSize: theme.typography.h2,
  },
  name: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  textLocked: {
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  reqContainer: {
    marginTop: 'auto',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    alignItems: 'center',
  },
  reqText: {
    fontSize: 9,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
});

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { useTheme } from '../context/ThemeContext';
import { getLeaderboardRequest } from '../api/users';
import { useAuth } from '../hooks/useAuth';

type Props = NativeStackScreenProps<RootStackParamList, 'Leaderboard'>;

const getRankTitle = (trustScore: number) => {
  if (trustScore >= 500) return 'City Champion 🏆';
  if (trustScore >= 250) return 'Community Guardian 🛡️';
  if (trustScore >= 100) return 'Active Guardian ⭐';
  return 'Contributor 🏅';
};

export default function LeaderboardScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    getLeaderboardRequest()
      .then((res) => {
        if (isActive) {
          if (res.success && 'data' in res) {
            setLeaderboard(res.data.leaderboard);
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

  const renderItem = ({ item, index }: { item: any; index: number }) => {
  
    const isMe = item._id === user?.id;
    const isTop3 = index < 3;
    const rankTitle = getRankTitle(item.trustScore);

    return (
      <AppCard style={[styles.card, isMe && styles.myCard]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, isTop3 && styles.topRankText]}>
            #{item.rank}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{item.fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.fullName} {isMe && '(You)'}</Text>
          <Text style={styles.title}>{rankTitle}</Text>
          <Text style={styles.stats}>
            {item.trustScore} Trust • {item.resolvedReports} Resolved
          </Text>
        </View>
      </AppCard>
    );
  };

  return (
    <Screen keyboardAvoiding={false}>
      <Header title="Leaderboard" subtitle="Top Civic Guardians" onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={leaderboard}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No users found on the leaderboard yet.</Text>
            }
          />
        )}
      </View>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loader: {
    marginTop: theme.spacing.xxl,
  },
  list: {
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  myCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  topRankText: {
    color: theme.colors.primary,
    fontSize: theme.typography.h3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
  },
  avatarInitial: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  stats: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});

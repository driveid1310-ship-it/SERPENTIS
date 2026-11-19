import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { useTheme } from '../context/ThemeContext';
import { getMyContributionsRequest } from '../api/users';

type Props = NativeStackScreenProps<RootStackParamList, 'ContributionHistory'>;

export default function ContributionHistoryScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    getMyContributionsRequest()
      .then((res) => {
        if (isActive) {
          if (res.success && 'data' in res) {
            setContributions(res.data.contributions);
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

  const renderItem = ({ item }: { item: any }) => {
    return (
      <AppCard style={styles.card}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{item.type === 'REPORT' ? '📋' : '💬'}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            {item.type === 'REPORT' && item.status && (
              <View style={[styles.statusBadge, (styles as any)[`status_${item.status}`]]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
          </View>
        </View>
      </AppCard>
    );
  };

  return (
    <Screen keyboardAvoiding={false}>
      <Header title="Contribution History" subtitle="Your civic activity" onBackPress={() => navigation.goBack()} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={contributions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You haven't made any contributions yet.</Text>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  icon: {
    fontSize: theme.typography.fontSizes.lg,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  date: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: theme.colors.surface,
  },
  status_pending: {
    backgroundColor: theme.colors.warning,
  },
  statusText: {
    fontSize: 10,
    color: theme.colors.background,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
  },
});

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
// (imports for types are declared above; avoid duplicate type imports)

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface QuickActionConfig {
  key: string;
  label: string;
  description: string;
}

interface NearbyIssueConfig {
  key: string;
  title: string;
  distance: string;
  status: string;
}

interface TrendingIssueConfig {
  key: string;
  title: string;
  votes: string;
  category: string;
}

interface HeritageSpotlightConfig {
  key: string;
  title: string;
  location: string;
}

const QUICK_ACTIONS: QuickActionConfig[] = [
  {
    key: 'report-issue',
    label: 'Report Issue',
    description: 'Flag a problem in your area',
  },
  {
    key: 'explore-map',
    label: 'Explore Map',
    description: 'View live activity nearby',
  },
  {
    key: 'community',
    label: 'Community',
    description: 'Connect with local members',
  },
  {
    key: 'heritage',
    label: 'Heritage',
    description: 'Discover local landmarks',
  },
];

const NEARBY_ISSUES: NearbyIssueConfig[] = [
  {
    key: 'nearby-1',
    title: 'Streetlight outage on 5th Ave',
    distance: '0.4 km away',
    status: 'Pending',
  },
  {
    key: 'nearby-2',
    title: 'Pothole near Central Park entrance',
    distance: '0.8 km away',
    status: 'In Progress',
  },
  {
    key: 'nearby-3',
    title: 'Overflowing bin at Market Square',
    distance: '1.2 km away',
    status: 'Pending',
  },
];

const TRENDING_ISSUES: TrendingIssueConfig[] = [
  {
    key: 'trending-1',
    title: 'Water supply disruption downtown',
    votes: '482 votes',
    category: 'Utilities',
  },
  {
    key: 'trending-2',
    title: 'Illegal dumping near riverbank',
    votes: '311 votes',
    category: 'Environment',
  },
  {
    key: 'trending-3',
    title: 'Traffic signal malfunction',
    votes: '204 votes',
    category: 'Infrastructure',
  },
];

const HERITAGE_SPOTLIGHT: HeritageSpotlightConfig = {
  key: 'heritage-spotlight-1',
  title: 'The Old Clock Tower',
  location: 'Founded 1887 · City Center',
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleQuickActionPress = useCallback((_key: string) => {
    // Static UI only — no backend wiring in this sprint.
  }, []);

  const handleViewAllNearbyPress = useCallback(() => {
    // Static UI only — no backend wiring in this sprint.
  }, []);

  const handleViewAllTrendingPress = useCallback(() => {
    // Static UI only — no backend wiring in this sprint.
  }, []);

  const handleHeritageSpotlightPress = useCallback(() => {
    // Static UI only — no backend wiring in this sprint.
  }, []);

  const handleLogoutPress = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      navigation.replace('Login');
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logout, navigation]);

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="SERPENTIS"
        subtitle="Welcome back, operator."
        rightAction={
          <Pressable
            onPress={handleLogoutPress}
            hitSlop={8}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={theme.colors.danger} />
            ) : (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </Pressable>
        }
      />

      <View style={styles.section}>
        <AppCard elevation="md">
          <View style={styles.trustScoreHeader}>
            <Text style={styles.trustScoreLabel}>Trust Score</Text>
            <View style={styles.trustScoreBadge}>
              <Text style={styles.trustScoreBadgeText}>VERIFIED</Text>
            </View>
          </View>
          <Text style={styles.trustScoreValue}>87</Text>
          <Text style={styles.trustScoreDescription}>
            Based on your contributions and community trust ratings.
          </Text>
        </AppCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <View key={action.key} style={styles.quickActionItem}>
              <AppCard
                elevation="sm"
                onPress={() => handleQuickActionPress(action.key)}
                style={styles.quickActionCard}
              >
                <Text style={styles.quickActionLabel}>{action.label}</Text>
                <Text style={styles.quickActionDescription} numberOfLines={2}>
                  {action.description}
                </Text>
              </AppCard>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Nearby Issues</Text>
          <Pressable onPress={handleViewAllNearbyPress} hitSlop={8}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {NEARBY_ISSUES.map((issue) => (
          <AppCard key={issue.key} elevation="sm" style={styles.listCard}>
            <View style={styles.listCardHeader}>
              <Text style={styles.listCardTitle} numberOfLines={1}>
                {issue.title}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{issue.status}</Text>
              </View>
            </View>
            <Text style={styles.listCardMeta}>{issue.distance}</Text>
          </AppCard>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trending Issues</Text>
          <Pressable onPress={handleViewAllTrendingPress} hitSlop={8}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {TRENDING_ISSUES.map((issue) => (
          <AppCard key={issue.key} elevation="sm" style={styles.listCard}>
            <View style={styles.listCardHeader}>
              <Text style={styles.listCardTitle} numberOfLines={1}>
                {issue.title}
              </Text>
              <Text style={styles.votesText}>{issue.votes}</Text>
            </View>
            <Text style={styles.listCardMeta}>{issue.category}</Text>
          </AppCard>
        ))}
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Heritage Spotlight</Text>
        <AppCard
          elevation="md"
          onPress={handleHeritageSpotlightPress}
          style={styles.heritageCard}
        >
          <View style={styles.heritageBadge}>
            <Text style={styles.heritageBadgeText}>FEATURED</Text>
          </View>
          <Text style={styles.heritageTitle}>{HERITAGE_SPOTLIGHT.title}</Text>
          <Text style={styles.heritageLocation}>
            {HERITAGE_SPOTLIGHT.location}
          </Text>
          <AppButton
            label="Explore Heritage Site"
            onPress={handleHeritageSpotlightPress}
            variant="outline"
            style={styles.heritageButton}
          />
        </AppCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoutText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.danger,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  viewAllText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.accent,
  },
  trustScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  trustScoreLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: 1,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  trustScoreBadge: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  trustScoreBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 1,
    color: theme.colors.accent,
  },
  trustScoreValue: {
    fontSize: 40,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  trustScoreDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  quickActionItem: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  quickActionCard: {
    minHeight: 96,
  },
  quickActionLabel: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  quickActionDescription: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  listCard: {
    marginBottom: theme.spacing.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  listCardTitle: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  listCardMeta: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },
  votesText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.accent,
  },
  heritageCard: {
    alignItems: 'flex-start',
  },
  heritageBadge: {
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.radius.round,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    marginBottom: theme.spacing.sm,
  },
  heritageBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 1,
    color: theme.colors.accent,
  },
  heritageTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  heritageLocation: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  heritageButton: {
    marginTop: theme.spacing.xs,
  },
});
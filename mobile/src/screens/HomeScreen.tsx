import React, { useCallback, useState } from 'react';
import { Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import { useAuth } from '../hooks/useAuth';
import { useTrendingReports } from '../hooks/useTrendingReports';
import { useRecentReports } from '../hooks/useRecentReports';
import { useNotifications } from '../hooks/useNotifications';
import type { ReportStatus } from '../types/report';
import { useTheme } from '../context/ThemeContext';
import { useCity } from '../context/CityContext';
import { getUnifiedOverviewRequest } from '../api/environment';
import type { UnifiedOverviewData } from '../types/environment';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const quickActions = [
  { title: 'Weather', subtitle: 'Forecast & heat index', icon: '☀️' },
  { title: 'Air Quality', subtitle: 'CPCB AQI & pollutants', icon: '🌬️' },
  { title: 'Alerts', subtitle: 'Climate risk warnings', icon: '⚠️' },
  { title: 'Monitoring', subtitle: 'Noise, water & waste', icon: '🔬' },
  { title: 'Analytics', subtitle: 'Trends & resolution', icon: '📈' },
  { title: 'AI Assistant', subtitle: 'Ask about your city', icon: '🤖' },
  { title: 'Smart Hub', subtitle: 'Scores, solar & carbon', icon: '🧠' },
  { title: 'Dashboard', subtitle: 'City statistics', icon: '📊' },
  { title: 'Places', subtitle: 'Explore nearby places', icon: '📍' },
  { title: 'SOS', subtitle: 'Get emergency help', icon: '🚨' },
];

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// Smallest safe relative-time formatter — no new dependency, plain Date
// math only, same approach already used on Notifications/SOS.
function formatRelativeTime(createdAt: string): string {
  const createdTimestamp = new Date(createdAt).getTime();

  if (Number.isNaN(createdTimestamp)) {
    return '';
  }

  const elapsedMs = Date.now() - createdTimestamp;

  if (elapsedMs < MINUTE_MS) {
    return 'Just now';
  }
  if (elapsedMs < HOUR_MS) {
    return `${Math.floor(elapsedMs / MINUTE_MS)}m ago`;
  }
  if (elapsedMs < DAY_MS) {
    return `${Math.floor(elapsedMs / HOUR_MS)}h ago`;
  }
  return `${Math.floor(elapsedMs / DAY_MS)}d ago`;
}

export default function HomeScreen({
  navigation,
}: HomeScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { selectedCity, temperatureUnit } = useCity();
  const [climateOverview, setClimateOverview] = useState<UnifiedOverviewData | null>(null);
  const { user, refreshUser } = useAuth();
  const {
    status: trendingStatus,
    reports: trendingReports,
    toggleUpvote,
    refetch: refetchTrending,
  } = useTrendingReports();
  const {
    status: recentStatus,
    reports: recentReports,
    refetch: refetchRecent,
  } = useRecentReports();
  const { notifications, refetch: refetchNotifications } = useNotifications();

  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  // Both report hooks and the notifications hook fetch once on mount only.
  // Without this, returning to Home after submitting a new report (or
  // reading notifications elsewhere) would keep showing stale data until
  // the app fully remounts. refreshUser() re-fetches the current user via
  // the same GET /auth/me path, so Trust Score updates too.
  useFocusEffect(
    useCallback(() => {
      refetchTrending();
      refetchRecent();
      refetchNotifications();
      refreshUser().catch(() => {});
      getUnifiedOverviewRequest({ slug: selectedCity.slug, unit: temperatureUnit })
        .then((res) => {
          if (res.success && 'data' in res) {
            setClimateOverview(res.data);
          }
        })
        .catch(() => {});
    }, [refetchTrending, refetchRecent, refetchNotifications, refreshUser, selectedCity.slug, temperatureUnit]),
  );

  const firstName = user?.fullName?.split(' ')[0] || 'Citizen';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.brandLockup}>
              <Image 
                source={require('../assets/images/serpentis-logo-transparent.png')} 
                style={styles.headerLogo}
                resizeMode="contain" 
              />
              <Text style={styles.eyebrow}>SERPENTIS</Text>
            </View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subtitle}>
              Stay informed. Stay connected.
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('Notifications')}
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notifications"
            >
              <Text style={styles.notificationIcon}>{'\uD83D\uDD14'}</Text>
              {unreadNotificationCount > 0 ? (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadNotificationCount > 9
                      ? '9+'
                      : unreadNotificationCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        {/* City Climate & Intelligence Overview */}
        <View style={styles.climateCard}>
          <View style={styles.climateTopRow}>
            <Pressable
              onPress={() => navigation.navigate('CitySelector')}
              style={styles.citySelectorChip}
            >
              <Text style={styles.citySelectorText}>
                📍 {selectedCity.name}, {selectedCity.state} ▾
              </Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('EnvironmentalAlerts')}
              style={styles.alertChip}
            >
              <Text style={styles.alertChipText}>
                {climateOverview
                  ? `${climateOverview.alerts.length} Alert${climateOverview.alerts.length === 1 ? '' : 's'}`
                  : 'Alerts'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.climateStatsRow}>
            <Pressable
              style={styles.climateStatBox}
              onPress={() => navigation.navigate('Weather')}
            >
              <Text style={styles.climateStatLabel}>WEATHER</Text>
              <Text style={styles.climateStatValue}>
                {climateOverview
                  ? `${climateOverview.weather.display.temperature}°${temperatureUnit}`
                  : '—'}
              </Text>
              <Text style={styles.climateStatSub} numberOfLines={1}>
                {climateOverview?.weather.current.condition ?? 'Tap to view'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.climateStatBox}
              onPress={() => navigation.navigate('AirQuality')}
            >
              <Text style={styles.climateStatLabel}>CPCB AQI</Text>
              <Text
                style={[
                  styles.climateStatValue,
                  climateOverview ? { color: climateOverview.airQuality.aqiColorHex } : null,
                ]}
              >
                {climateOverview?.airQuality.overallAqi ?? '—'}
              </Text>
              <Text style={styles.climateStatSub} numberOfLines={1}>
                {climateOverview?.airQuality.aqiCategory ?? 'Tap to view'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.climateStatBox}
              onPress={() => navigation.navigate('CityIntelligence')}
            >
              <Text style={styles.climateStatLabel}>ENV SCORE</Text>
              <Text style={styles.climateStatValue}>
                {climateOverview?.scores.environmentalHealth.score ?? '—'}
              </Text>
              <Text style={styles.climateStatSub} numberOfLines={1}>
                {climateOverview?.scores.environmentalHealth.band ?? 'Smart Hub'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Trust Score */}
        <View style={styles.trustCard}>
          <View style={styles.trustTopRow}>
            <View>
              <Text style={styles.cardEyebrow}>COMMUNITY TRUST</Text>
              <Text style={styles.trustTitle}>Your Trust Score</Text>
            </View>

            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{user?.trustScore ?? 0}</Text>
              <Text style={styles.scoreLabel}>/100</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    Math.max(user?.trustScore ?? 0, 0),
                    100,
                  )}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.trustDescription}>
            Your reports and community activity are helping make the
            neighbourhood better.
          </Text>
          <Pressable onPress={() => navigation.navigate('Leaderboard')} style={styles.leaderboardLink}>
            <Text style={styles.leaderboardLinkText}>View Leaderboard →</Text>
          </Pressable>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>
              What would you like to do?
            </Text>
          </View>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => {
                const routeMap: Record<string, keyof RootStackParamList> = {
                  Weather: 'Weather',
                  'Air Quality': 'AirQuality',
                  Alerts: 'EnvironmentalAlerts',
                  Monitoring: 'EnvironmentalMonitoring',
                  Analytics: 'EnvironmentalAnalytics',
                  'AI Assistant': 'CityAssistant',
                  'Smart Hub': 'CityIntelligence',
                  Dashboard: 'Dashboard',
                  Places: 'Places',
                  SOS: 'SOS',
                };
                const target = routeMap[action.title];
                if (target) {
                  navigation.navigate(target as any);
                }
              }}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>{action.icon}</Text>
              </View>

              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>
                {action.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Recent Reports */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <Text style={styles.sectionSubtitle}>
              Latest reports from the community
            </Text>
          </View>

          <Pressable onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.viewAll}>View all</Text>
          </Pressable>
        </View>

        {recentStatus === 'loading' ? (
          <View style={styles.trendingLoadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {recentStatus === 'empty' ? (
          <Text style={styles.sectionSubtitle}>No recent reports yet.</Text>
        ) : null}

        {recentStatus === 'success'
          ? recentReports.map((report) => (
              <Pressable
                key={report._id}
                style={styles.issueCard}
                onPress={() =>
                  navigation.navigate('ReportDetails', { reportId: report._id })
                }
              >
                <View style={styles.issueIcon}>
                  <Text style={styles.issueIconText}>!</Text>
                </View>

                <View style={styles.issueContent}>
                  <Text style={styles.issueTitle}>{report.title}</Text>
                  <Text style={styles.issueLocation}>
                    {formatRelativeTime(report.createdAt)}
                  </Text>
                </View>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {REPORT_STATUS_LABELS[report.status]}
                  </Text>
                </View>
              </Pressable>
            ))
          : null}

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Trending Issues</Text>
            <Text style={styles.sectionSubtitle}>
              What your community is talking about
            </Text>
          </View>
        </View>

        {trendingStatus === 'loading' ? (
          <View style={styles.trendingLoadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : null}

        {trendingStatus === 'empty' ? (
          <Text style={styles.sectionSubtitle}>No trending reports yet.</Text>
        ) : null}

        {trendingStatus === 'success'
          ? trendingReports.map((report, index) => {
              const hasUpvoted = Boolean(
                user && report.upvotes.includes(user.id),
              );
              return (
                <Pressable
                  key={report._id}
                  style={styles.trendingCard}
                  onPress={() =>
                    navigation.navigate('ReportDetails', {
                      reportId: report._id,
                    })
                  }
                >
                  <View style={styles.trendingNumber}>
                    <Text style={styles.trendingNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.trendingContent}>
                    <Text style={styles.trendingTitle}>
                      {report.title}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.upvoteButton}
                    disabled={!user}
                    onPress={async (e) => {
                      e.stopPropagation(); // Prevent navigating to report details
                      if (!user) {
                        return;
                      }
                      await toggleUpvote(report, user.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.trendingReports,
                        hasUpvoted && styles.trendingReportsActive,
                      ]}
                    >
                      {hasUpvoted ? '▲' : '△'} {report.upvotes.length}
                    </Text>
                  </Pressable>
                </Pressable>
              );
            })
          : null}

        {/* Heritage */}
        <View style={styles.heritageCard}>
          <View style={styles.heritageBadge}>
            <Text style={styles.heritageBadgeText}>HERITAGE</Text>
          </View>

          <Text style={styles.heritageTitle}>
            Discover Your City's Heritage
          </Text>

          <Text style={styles.heritageDescription}>
            Explore historical places, stories and cultural landmarks
            around you.
          </Text>

          <Pressable
            onPress={() => navigation.navigate('Heritage')}
            style={({ pressed }) => [
              styles.heritageButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.heritageButtonText}>
              Explore Heritage
            </Text>
            <Text style={styles.heritageArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          SERPENTIS • Building better communities together
        </Text>
      </ScrollView>
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },

  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  headerLogo: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: theme.colors.text,
  },
  eyebrow: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },

  greeting: {
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },

  subtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    position: 'relative',
  },

  notificationIcon: {
    fontSize: theme.typography.fontSizes.md,
  },

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.white,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  profileInitial: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },

  pressed: {
    opacity: 0.7,
  },

  trustCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },

  trustTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardEyebrow: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },

  trustTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },

  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },

  scoreValue: {
    fontSize: theme.typography.h2,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },

  scoreLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: -4,
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    marginTop: theme.spacing.lg,
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },

  trustDescription: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSizes.sm,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
  leaderboardLink: {
    marginTop: 12,
  },
  leaderboardLinkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },

  sectionTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },

  viewAll: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textSecondary,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionCard: {
    width: '48%',
    minHeight: 145,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    marginBottom: theme.spacing.md,
  },

  actionIconText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },

  actionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },

  actionSubtitle: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.fontSizes.xs,
    lineHeight: 17,
    color: theme.colors.textSecondary,
  },

  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  issueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error + "20",
    marginRight: theme.spacing.md,
  },

  issueIconText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
  },

  issueContent: {
    flex: 1,
  },

  issueTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },

  issueLocation: {
    marginTop: 3,
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primaryMuted,
  },

  statusText: {
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.primary,
  },

  trendingLoadingRow: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  trendingNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryMuted,
    marginRight: theme.spacing.md,
  },

  trendingNumberText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },

  trendingContent: {
    flex: 1,
  },

  trendingTitle: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text,
  },

  trendingReports: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textSecondary,
  },

  trendingReportsActive: {
    color: theme.colors.primary,
  },
  upvoteButton: {
    padding: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heritageCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  heritageBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  heritageBadgeText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  heritageTitle: {
    fontSize: theme.typography.h3,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  heritageDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  heritageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heritageButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  heritageArrow: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.primary,
  },
  footerText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  climateCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  climateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  citySelectorChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  citySelectorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  alertChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primarySoft,
  },
  alertChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  climateStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  climateStatBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  climateStatLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.textTertiary,
  },
  climateStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    marginVertical: 2,
  },
  climateStatSub: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
});

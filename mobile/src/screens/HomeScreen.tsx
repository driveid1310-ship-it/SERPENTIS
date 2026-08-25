import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import { useAuth } from '../hooks/useAuth';
import { authTheme } from '../theme/authTheme';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const quickActions = [
  {
    title: 'Report Issue',
    subtitle: 'Report a civic problem',
    icon: '!',
  },
  {
    title: 'SOS',
    subtitle: 'Get emergency help',
    icon: 'SOS',
  },
  {
    title: 'Places',
    subtitle: 'Explore nearby places',
    icon: '⌖',
  },
  {
    title: 'Services',
    subtitle: 'Find public services',
    icon: '✓',
  },
];

const nearbyIssues = [
  {
    title: 'Road damage',
    location: '0.8 km away',
    status: 'In progress',
  },
  {
    title: 'Street light outage',
    location: '1.2 km away',
    status: 'Reported',
  },
];

const trendingIssues = [
  {
    title: 'Water supply interruption',
    reports: '24 reports',
  },
  {
    title: 'Traffic signal issue',
    reports: '17 reports',
  },
];

export default function HomeScreen({
  navigation,
}: HomeScreenProps) {
  const { user } = useAuth();

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
            <Text style={styles.eyebrow}>SERPENTIS</Text>
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
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Profile')}
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Profile"
            >
              <Text style={styles.profileInitial}>
                {firstName.charAt(0).toUpperCase()}
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
              <Text style={styles.scoreValue}>82</Text>
              <Text style={styles.scoreLabel}>/100</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <Text style={styles.trustDescription}>
            Your reports and community activity are helping make the
            neighbourhood better.
          </Text>
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
                if (action.title === 'Report Issue') {
                  navigation.navigate('ReportIssue');
                }
                if (action.title === 'Places') {
                  navigation.navigate('Places');
                }
                if (action.title === 'SOS') {
                  navigation.navigate('SOS');
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

        {/* Nearby Issues */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Nearby Issues</Text>
            <Text style={styles.sectionSubtitle}>
              Recent activity around you
            </Text>
          </View>

          <Text style={styles.viewAll}>View all</Text>
        </View>

        {nearbyIssues.map((issue) => (
          <View key={issue.title} style={styles.issueCard}>
            <View style={styles.issueIcon}>
              <Text style={styles.issueIconText}>!</Text>
            </View>

            <View style={styles.issueContent}>
              <Text style={styles.issueTitle}>{issue.title}</Text>
              <Text style={styles.issueLocation}>
                {issue.location}
              </Text>
            </View>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{issue.status}</Text>
            </View>
          </View>
        ))}

        {/* Trending */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Trending Issues</Text>
            <Text style={styles.sectionSubtitle}>
              What your community is talking about
            </Text>
          </View>
        </View>

        {trendingIssues.map((issue, index) => (
          <View key={issue.title} style={styles.trendingCard}>
            <View style={styles.trendingNumber}>
              <Text style={styles.trendingNumberText}>
                {index + 1}
              </Text>
            </View>

            <View style={styles.trendingContent}>
              <Text style={styles.trendingTitle}>
                {issue.title}
              </Text>
              <Text style={styles.trendingReports}>
                {issue.reports}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </View>
        ))}

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

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: authTheme.spacing.lg,
    paddingTop: authTheme.spacing.lg,
    paddingBottom: authTheme.spacing.xxxl,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: authTheme.spacing.xl,
  },

  eyebrow: {
    fontSize: authTheme.typography.fontSizes.xs,
    fontWeight: authTheme.typography.fontWeights.bold,
    letterSpacing: 2,
    color: authTheme.colors.accent,
    marginBottom: authTheme.spacing.xs,
  },

  greeting: {
    fontSize: authTheme.typography.h2,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  subtitle: {
    marginTop: authTheme.spacing.xs,
    fontSize: authTheme.typography.fontSizes.sm,
    color: authTheme.colors.textSecondary,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: authTheme.spacing.sm,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  notificationIcon: {
    fontSize: authTheme.typography.fontSizes.md,
  },

  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  profileInitial: {
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.accent,
  },

  pressed: {
    opacity: 0.7,
  },

  trustCard: {
    backgroundColor: authTheme.colors.glass,
    borderWidth: 1,
    borderColor: authTheme.colors.glassBorder,
    borderRadius: authTheme.radius.xl,
    padding: authTheme.spacing.xl,
    marginBottom: authTheme.spacing.xxl,
  },

  trustTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardEyebrow: {
    fontSize: authTheme.typography.fontSizes.xs,
    fontWeight: authTheme.typography.fontWeights.bold,
    letterSpacing: 1.5,
    color: authTheme.colors.textSecondary,
    marginBottom: authTheme.spacing.xs,
  },

  trustTitle: {
    fontSize: authTheme.typography.h3,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: authTheme.colors.accent,
  },

  scoreValue: {
    fontSize: authTheme.typography.h2,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  scoreLabel: {
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.textSecondary,
    marginTop: -4,
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: authTheme.colors.border,
    overflow: 'hidden',
    marginTop: authTheme.spacing.lg,
  },

  progressFill: {
    width: '82%',
    height: '100%',
    backgroundColor: authTheme.colors.accent,
    borderRadius: 4,
  },

  trustDescription: {
    marginTop: authTheme.spacing.md,
    fontSize: authTheme.typography.fontSizes.sm,
    lineHeight: 20,
    color: authTheme.colors.textSecondary,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: authTheme.spacing.md,
    marginTop: authTheme.spacing.lg,
  },

  sectionTitle: {
    fontSize: authTheme.typography.h3,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.textSecondary,
  },

  viewAll: {
    fontSize: authTheme.typography.fontSizes.xs,
    fontWeight: authTheme.typography.fontWeights.semibold,
    color: authTheme.colors.accent,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  actionCard: {
    width: '48%',
    minHeight: 145,
    padding: authTheme.spacing.lg,
    marginBottom: authTheme.spacing.md,
    borderRadius: authTheme.radius.lg,
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: authTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.accentMuted,
    marginBottom: authTheme.spacing.md,
  },

  actionIconText: {
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.accent,
  },

  actionTitle: {
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.semibold,
    color: authTheme.colors.textPrimary,
  },

  actionSubtitle: {
    marginTop: authTheme.spacing.xs,
    fontSize: authTheme.typography.fontSizes.xs,
    lineHeight: 17,
    color: authTheme.colors.textSecondary,
  },

  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: authTheme.spacing.md,
    marginBottom: authTheme.spacing.sm,
    borderRadius: authTheme.radius.lg,
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  issueIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.errorMuted,
    marginRight: authTheme.spacing.md,
  },

  issueIconText: {
    fontSize: authTheme.typography.fontSizes.md,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.error,
  },

  issueContent: {
    flex: 1,
  },

  issueTitle: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.semibold,
    color: authTheme.colors.textPrimary,
  },

  issueLocation: {
    marginTop: 3,
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: authTheme.spacing.sm,
    paddingVertical: authTheme.spacing.xs,
    borderRadius: authTheme.radius.round,
    backgroundColor: authTheme.colors.accentMuted,
  },

  statusText: {
    fontSize: 10,
    fontWeight: authTheme.typography.fontWeights.semibold,
    color: authTheme.colors.accent,
  },

  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: authTheme.spacing.md,
    marginBottom: authTheme.spacing.sm,
    borderRadius: authTheme.radius.lg,
    backgroundColor: authTheme.colors.surface,
    borderWidth: 1,
    borderColor: authTheme.colors.border,
  },

  trendingNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: authTheme.colors.accentMuted,
    marginRight: authTheme.spacing.md,
  },

  trendingNumberText: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.accent,
  },

  trendingContent: {
    flex: 1,
  },

  trendingTitle: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.semibold,
    color: authTheme.colors.textPrimary,
  },

  trendingReports: {
    marginTop: 3,
    fontSize: authTheme.typography.fontSizes.xs,
    color: authTheme.colors.textSecondary,
  },

  arrow: {
    fontSize: 28,
    color: authTheme.colors.textSecondary,
    marginLeft: authTheme.spacing.sm,
  },

  heritageCard: {
    marginTop: authTheme.spacing.xl,
    padding: authTheme.spacing.xl,
    borderRadius: authTheme.radius.xl,
    backgroundColor: authTheme.colors.glass,
    borderWidth: 1,
    borderColor: authTheme.colors.glassBorder,
  },

  heritageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: authTheme.spacing.sm,
    paddingVertical: authTheme.spacing.xs,
    borderRadius: authTheme.radius.round,
    backgroundColor: authTheme.colors.accentMuted,
    marginBottom: authTheme.spacing.md,
  },

  heritageBadgeText: {
    fontSize: 10,
    fontWeight: authTheme.typography.fontWeights.bold,
    letterSpacing: 1,
    color: authTheme.colors.accent,
  },

  heritageTitle: {
    fontSize: authTheme.typography.h3,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.textPrimary,
  },

  heritageDescription: {
    marginTop: authTheme.spacing.sm,
    fontSize: authTheme.typography.fontSizes.sm,
    lineHeight: 20,
    color: authTheme.colors.textSecondary,
  },

  heritageButton: {
    marginTop: authTheme.spacing.lg,
    minHeight: 46,
    paddingHorizontal: authTheme.spacing.lg,
    borderRadius: authTheme.radius.md,
    backgroundColor: authTheme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heritageButtonText: {
    fontSize: authTheme.typography.fontSizes.sm,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.background,
  },

  heritageArrow: {
    marginLeft: authTheme.spacing.sm,
    fontSize: 18,
    fontWeight: authTheme.typography.fontWeights.bold,
    color: authTheme.colors.background,
  },

  footerText: {
    marginTop: authTheme.spacing.xxl,
    textAlign: 'center',
    fontSize: 10,
    color: authTheme.colors.placeholder,
  },
});
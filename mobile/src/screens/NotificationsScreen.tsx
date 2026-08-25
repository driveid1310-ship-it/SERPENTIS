import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import { theme } from '../theme';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

type NotificationType = 'issue-update' | 'community' | 'heritage' | 'system';

interface NotificationTypeMeta {
  label: string;
  icon: string;
}

const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  'issue-update': { label: 'Issue Update', icon: '!' },
  community: { label: 'Community', icon: '\u2605' },
  heritage: { label: 'Heritage', icon: '\uD83C\uDFDB' },
  system: { label: 'System', icon: '\u2139' },
};

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeLabel: string;
  isRead: boolean;
}

// Local placeholder content — same "sample data" convention already used
// on Home and Places (static illustrative items, not a live API result).
// api/notifications.ts and useNotifications.ts exist as empty stubs with
// no backend behind them yet, so nothing here is fetched or synced.
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'sample-1',
    type: 'issue-update',
    title: 'Your report was reviewed',
    message: '"Road damage" near Main Street moved to In Progress.',
    timeLabel: 'Sample data — 2h ago',
    isRead: false,
  },
  {
    id: 'sample-2',
    type: 'community',
    title: 'Your trust score went up',
    message: 'Thanks for your recent activity in the community.',
    timeLabel: 'Sample data — 1d ago',
    isRead: false,
  },
  {
    id: 'sample-3',
    type: 'heritage',
    title: 'New heritage spot nearby',
    message: 'A newly added historical site is close to your area.',
    timeLabel: 'Sample data — 2d ago',
    isRead: true,
  },
  {
    id: 'sample-4',
    type: 'system',
    title: 'Welcome to SERPENTIS',
    message: 'Explore reports, places and community updates.',
    timeLabel: 'Sample data — 5d ago',
    isRead: true,
  },
];

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>(
    INITIAL_NOTIFICATIONS,
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNotificationPress = useCallback((id: string) => {
    // Marking as read is local UI state only — it isn't synced anywhere,
    // so this doesn't claim any backend confirmation.
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  }, []);

  const handleMarkAllAsReadPress = useCallback(() => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, isRead: true })),
    );
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <Screen scrollable keyboardAvoiding={false}>
      <Header
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
            : 'You are all caught up'
        }
        onBackPress={handleBackPress}
      />

      <View style={styles.section}>
        <Text style={styles.noticeText}>
          Showing sample notifications — live updates and push notifications
          will be connected in a future update.
        </Text>
      </View>

      {notifications.length > 0 ? (
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllAsReadPress} hitSlop={8}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {notifications.length === 0 ? (
        <View style={styles.section}>
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No notifications right now.
            </Text>
          </AppCard>
        </View>
      ) : (
        <View style={[styles.section, styles.lastSection]}>
          {notifications.map((notification) => {
            const meta = NOTIFICATION_TYPE_META[notification.type];
            return (
              <Pressable
                key={notification.id}
                onPress={() => handleNotificationPress(notification.id)}
              >
                <AppCard
                  elevation="sm"
                  style={[
                    styles.notificationCard,
                    !notification.isRead && styles.notificationCardUnread,
                  ]}
                >
                  <View style={styles.notificationRow}>
                    <View style={styles.iconBadge}>
                      <Text style={styles.iconBadgeText}>{meta.icon}</Text>
                    </View>

                    <View style={styles.notificationContent}>
                      <View style={styles.notificationTitleRow}>
                        <Text
                          style={styles.notificationTitle}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead ? (
                          <View style={styles.unreadDot} />
                        ) : null}
                      </View>
                      <Text
                        style={styles.notificationMessage}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notification.timeLabel}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: theme.spacing.lg,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
  },
  noticeText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  markAllText: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.accent,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  notificationCard: {
    marginBottom: theme.spacing.sm,
  },
  notificationCardUnread: {
    borderColor: theme.colors.accent,
  },
  notificationRow: {
    flexDirection: 'row',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconBadgeText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.accent,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  notificationTitle: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.textPrimary,
    marginRight: theme.spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    lineHeight: 17,
    marginBottom: theme.spacing.xs,
  },
  notificationTime: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.placeholder,
  },
});

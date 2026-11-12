import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import Screen from '../components/Screen/Screen';
import Header from '../components/Header/Header';
import AppCard from '../components/Card/AppCard';
import AppButton from '../components/Button/AppButton';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification, NotificationType } from '../types/notification';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notifications'
>;

interface NotificationsScreenProps {
  navigation: NotificationsScreenNavigationProp;
}

interface NotificationTypeMeta {
  label: string;
  icon: string;
}

const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  report: { label: 'Report Update', icon: '!' },
  badge: { label: 'Badge', icon: '\u2605' },
  sos: { label: 'SOS Alert', icon: '\u26A0' },
  system: { label: 'System', icon: '\u2139' },
  'environmental-alert': { label: 'Climate Alert', icon: '🌡️' },
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

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

export default function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { status, notifications, errorMessage, refetch, markAsRead, markAllAsRead } =
    useNotifications();

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      if (notification.isRead) {
        return;
      }
      await markAsRead(notification._id);
    },
    [markAsRead],
  );

  const handleMarkAllAsReadPress = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

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

      {status === 'success' ? (
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {unreadCount > 0 ? (
            <Pressable onPress={handleMarkAllAsReadPress} hitSlop={8}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {status === 'loading' ? (
        <View style={styles.section}>
          <AppCard elevation="sm">
            <View style={styles.loadingRow}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          </AppCard>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.section}>
          <AppCard elevation="sm" style={styles.errorCard}>
            <Text style={styles.errorTitle}>Couldn&apos;t load notifications</Text>
            <Text style={styles.errorMessage}>
              {errorMessage ?? 'Please try again.'}
            </Text>
            <AppButton
              label="Retry"
              onPress={refetch}
              variant="outline"
              style={styles.errorRetryButton}
            />
          </AppCard>
        </View>
      ) : null}

      {status === 'empty' ? (
        <View style={styles.section}>
          <AppCard elevation="sm">
            <Text style={styles.emptyStateText}>
              No notifications right now.
            </Text>
          </AppCard>
        </View>
      ) : null}

      {status === 'success' ? (
        <View style={[styles.section, styles.lastSection]}>
          {notifications.map((notification) => {
            const meta = NOTIFICATION_TYPE_META[notification.type];
            return (
              <Pressable
                key={notification._id}
                onPress={async () => {
                  await handleNotificationPress(notification);
                }}
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
                        {formatRelativeTime(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </AppCard>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </Screen>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  section: {
    marginTop: theme.spacing.lg,
  },
  lastSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
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
    color: theme.colors.primary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
  },
  errorCard: {
    borderColor: theme.colors.error,
  },
  errorTitle: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorMessage: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  errorRetryButton: {
    alignSelf: 'flex-start',
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
    borderColor: theme.colors.primary,
  },
  notificationRow: {
    flexDirection: 'row',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconBadgeText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
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
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
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

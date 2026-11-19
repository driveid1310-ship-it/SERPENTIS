import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';

const NOTIFICATION_PERMISSION_ASKED_KEY = '@serpentis/notification_permission_asked_v1';

export type NotificationPermissionState = 'granted' | 'denied' | 'not-required';

function requiresRuntimeNotificationPermission(): boolean {
  if (Platform.OS !== 'android') {
    return false;
  }
  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : Number(Platform.Version);
  return !Number.isNaN(apiLevel) && apiLevel >= 33;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  if (!requiresRuntimeNotificationPermission()) {
    return 'not-required';
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (!permission || typeof PermissionsAndroid.check !== 'function') {
    return 'denied';
  }

  try {
    const granted = await PermissionsAndroid.check(permission);
    return granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!requiresRuntimeNotificationPermission()) {
    return 'not-required';
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (!permission) {
    return 'denied';
  }

  try {
    const alreadyGranted =
      typeof PermissionsAndroid.check === 'function'
        ? await PermissionsAndroid.check(permission)
        : false;
    if (alreadyGranted) {
      return 'granted';
    }

    await AsyncStorage.setItem(NOTIFICATION_PERMISSION_ASKED_KEY, '1');
    const result = await PermissionsAndroid.request(permission, {
      title: 'SERPENTIS Alert Notifications',
      message:
        'Allow SERPENTIS to send civic updates and severe climate/AQI warnings when notifications are enabled.',
      buttonPositive: 'Allow',
      buttonNegative: 'Not Now',
    });

    return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

/**
 * Prompts for Android 13+ POST_NOTIFICATIONS permission at most once automatically
 * to avoid repeatedly nagging users who decline. Users can re-enable later in Notifications.
 */
export async function ensureNotificationPermissionOnce(): Promise<NotificationPermissionState> {
  if (!requiresRuntimeNotificationPermission()) {
    return 'not-required';
  }

  try {
    const current = await getNotificationPermissionStatus();
    if (current === 'granted') {
      return 'granted';
    }

    const askedBefore = await AsyncStorage.getItem(NOTIFICATION_PERMISSION_ASKED_KEY);
    if (askedBefore === '1') {
      return current;
    }

    return await requestNotificationPermission();
  } catch {
    return 'denied';
  }
}

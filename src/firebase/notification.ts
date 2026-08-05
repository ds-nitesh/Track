/**
 * Firebase Cloud Messaging helpers.
 *
 * The Firebase JS SDK has limited FCM support on React Native.
 * For production push on iOS/Android, install:
 *   @react-native-firebase/app
 *   @react-native-firebase/messaging
 * and wire native google-services / GoogleService-Info.plist.
 *
 * This module provides a clean interface used by the app, with a
 * graceful no-op fallback until native FCM is configured.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import {firestoreApi} from './firestore';

export type NotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

type MessageHandler = (payload: NotificationPayload) => void;

let foregroundHandler: MessageHandler | null = null;
let tokenRefreshUnsub: (() => void) | null = null;

const requestAndroidPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

/**
 * Attempt to load @react-native-firebase/messaging if present.
 * Returns null when the native package is not installed.
 */
const getNativeMessaging = (): any | null => {
  try {
    // Dynamic require keeps the JS bundle working without the native module.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
};

export const notificationApi = {
  async requestPermission(): Promise<boolean> {
    const androidOk = await requestAndroidPermission();
    if (!androidOk) {
      return false;
    }

    const messaging = getNativeMessaging();
    if (!messaging) {
      console.log('[Track] FCM native module not installed — notifications mocked.');
      return true;
    }

    const authStatus = await messaging().requestPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  },

  async getToken(): Promise<string | null> {
    const messaging = getNativeMessaging();
    if (!messaging) {
      return null;
    }
    try {
      return await messaging().getToken();
    } catch (error) {
      console.warn('[Track] FCM getToken failed', error);
      return null;
    }
  },

  async saveTokenForUser(uid: string): Promise<void> {
    const token = await this.getToken();
    if (token) {
      await firestoreApi.updateUserProfile(uid, {fcmToken: token});
    }
  },

  /**
   * Register listeners for foreground / background / quit-state messages.
   * Background & terminated handlers should also be registered in index.js
   * via messaging().setBackgroundMessageHandler(...).
   */
  async initialize(uid: string, onForeground?: MessageHandler): Promise<void> {
    const granted = await this.requestPermission();
    if (!granted) {
      return;
    }

    await this.saveTokenForUser(uid);
    foregroundHandler = onForeground ?? null;

    const messaging = getNativeMessaging();
    if (!messaging) {
      return;
    }

    messaging().onMessage(async (remoteMessage: any) => {
      const payload: NotificationPayload = {
        title: remoteMessage.notification?.title ?? 'Track',
        body: remoteMessage.notification?.body ?? '',
        data: remoteMessage.data,
      };
      foregroundHandler?.(payload);
    });

    tokenRefreshUnsub = messaging().onTokenRefresh(async (token: string) => {
      await firestoreApi.updateUserProfile(uid, {fcmToken: token});
    });

    // Opened from quit / background
    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('[Track] Notification opened app', remoteMessage?.data);
    });

    const initial = await messaging().getInitialNotification();
    if (initial) {
      console.log('[Track] App opened from quit via notification', initial?.data);
    }
  },

  cleanup() {
    tokenRefreshUnsub?.();
    tokenRefreshUnsub = null;
    foregroundHandler = null;
  },

  /** Local reminder helpers — schedule via Cloud Functions or device alarms in production */
  reminderTemplates: {
    daily: (): NotificationPayload => ({
      title: 'Daily expense reminder',
      body: 'Don’t forget to log today’s spending in Track.',
    }),
    budgetAlert: (category: string): NotificationPayload => ({
      title: 'Budget alert',
      body: `You’ve exceeded your ${category} budget this month.`,
    }),
    monthly: (): NotificationPayload => ({
      title: 'Monthly summary ready',
      body: 'Review your income, expenses, and savings for this month.',
    }),
  },
};

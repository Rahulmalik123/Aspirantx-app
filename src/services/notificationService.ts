import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp as fcmOnNotificationOpenedApp,
  getInitialNotification as fcmGetInitialNotification,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import apiClient from '../api/client';
import { requestNotificationPermission } from '../utils/permissions.utils';

// Called from index.js — registers background/quit state handler
export const registerBackgroundHandler = () => {
  setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    console.log('🔔 [FCM] Background message:', remoteMessage.notification?.title);
  });
};

class NotificationService {
  private fcmToken: string | null = null;

  async initialize() {
    try {
      console.log('📱 [FCM] Initializing...');

      // Uses react-native-permissions — shows consent dialog before asking
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.warn('⚠️ [FCM] Notification permission not granted');
        return null;
      }

      const token = await getToken(getMessaging());
      if (!token) {
        console.warn('⚠️ [FCM] Could not get FCM token');
        return null;
      }

      this.fcmToken = token;
      console.log('✅ [FCM] Token obtained');

      await this.saveToken(token);

      // Listen for token refresh
      onTokenRefresh(getMessaging(), async (newToken) => {
        console.log('🔄 [FCM] Token refreshed');
        this.fcmToken = newToken;
        await this.saveToken(newToken);
      });

      return token;
    } catch (err) {
      console.error('❌ [FCM] Initialization failed:', err);
      return null;
    }
  }

  private async saveToken(token: string) {
    try {
      await apiClient.post('/api/v1/auth/fcm-token', { fcmToken: token });
      console.log('✅ [FCM] Token saved to backend');
    } catch (err) {
      console.error('❌ [FCM] Failed to save token:', err);
    }
  }

  onForegroundMessage(handler: (msg: FirebaseMessagingTypes.RemoteMessage) => void) {
    return onMessage(getMessaging(), handler);
  }

  onNotificationOpenedApp(handler: (msg: FirebaseMessagingTypes.RemoteMessage) => void) {
    return fcmOnNotificationOpenedApp(getMessaging(), handler);
  }

  async getInitialNotification() {
    return fcmGetInitialNotification(getMessaging());
  }

  async getToken(): Promise<string | null> {
    return this.fcmToken;
  }
}

export default new NotificationService();

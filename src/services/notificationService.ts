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
import notifee, {
  AndroidImportance,
  AndroidStyle,
  AndroidVisibility,
  EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import apiClient from '../api/client';
import { requestNotificationPermission } from '../utils/permissions.utils';

// ─── Notification type → channel config ───────────────────────────────────────
const CHANNEL_CONFIG: Record<string, {
  id: string;
  name: string;
  color: string;
  importance: AndroidImportance;
}> = {
  achievement: {
    id: 'aspirantx-achievement',
    name: 'Achievements',
    color: '#F59E0B',
    importance: AndroidImportance.HIGH,
  },
  reward: {
    id: 'aspirantx-reward',
    name: 'Rewards & Coins',
    color: '#8B5CF6',
    importance: AndroidImportance.HIGH,
  },
  battle: {
    id: 'aspirantx-battle',
    name: 'Battles',
    color: '#F97316',
    importance: AndroidImportance.HIGH,
  },
  tournament: {
    id: 'aspirantx-tournament',
    name: 'Tournaments',
    color: '#10B981',
    importance: AndroidImportance.HIGH,
  },
  alert: {
    id: 'aspirantx-alert',
    name: 'Alerts',
    color: '#EF4444',
    importance: AndroidImportance.URGENT,
  },
  reminder: {
    id: 'aspirantx-reminder',
    name: 'Reminders',
    color: '#3B82F6',
    importance: AndroidImportance.HIGH,
  },
  general: {
    id: 'aspirantx-general',
    name: 'General',
    color: '#0040a1',
    importance: AndroidImportance.HIGH,
  },
};

function getChannel(type?: string) {
  return CHANNEL_CONFIG[type || 'general'] ?? CHANNEL_CONFIG.general;
}

// ─── Create all channels (call once on app start) ─────────────────────────────
async function createChannels() {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    Object.values(CHANNEL_CONFIG).map(ch =>
      notifee.createChannel({
        id: ch.id,
        name: ch.name,
        importance: ch.importance,
        visibility: AndroidVisibility.PUBLIC,
        vibration: true,
        lights: true,
        lightColor: ch.color,
        sound: 'default',
      })
    )
  );
}

// ─── Display a styled notifee notification from an FCM data payload ───────────
export async function displayNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage
) {
  const d = remoteMessage.data || {};
  const title: string = (d.title as string) || 'AspirantX';
  const body: string = (d.body as string) || '';
  const type: string = (d.type as string) || 'general';
  const imageUrl: string | undefined = d.imageUrl as string | undefined;
  const priority: string = (d.priority as string) || 'medium';

  const channel = getChannel(type);

  await notifee.displayNotification({
    title: `<b>${title}</b>`,
    body,
    data: d,
    android: {
      channelId: channel.id,
      color: channel.color,
      smallIcon: 'ic_notification',
      importance: priority === 'high' ? AndroidImportance.URGENT : channel.importance,
      style: {
        type: AndroidStyle.BIGTEXT,
        text: body,
        title: `<b>${title}</b>`,
        summary: 'AspirantX',
      },
      pressAction: { id: 'default', launchActivity: 'default' },
      visibility: AndroidVisibility.PUBLIC,
      ...(imageUrl && {
        largeIcon: imageUrl,
        style: {
          type: AndroidStyle.BIGPICTURE,
          picture: imageUrl,
          largeIcon: imageUrl,
        },
      }),
    },
    ios: {
      sound: 'default',
      ...(imageUrl && { attachments: [{ url: imageUrl }] }),
      interruptionLevel: priority === 'high' ? 'timeSensitive' : 'active',
    },
  });
}

// ─── Background/killed handler (registered before app mounts) ─────────────────
export const registerBackgroundHandler = () => {
  // FCM background message → display via notifee
  setBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    await displayNotification(remoteMessage);
  });

  // Notifee background event (notification tap when app is killed/background)
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      // Navigation handled when app opens via getInitialNotification
    }
  });
};

// ─── Main NotificationService class ──────────────────────────────────────────
class NotificationService {
  private fcmToken: string | null = null;

  async initialize() {
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.warn('⚠️ [FCM] Notification permission not granted');
        return null;
      }

      // Create styled channels first
      await createChannels();

      const token = await getToken(getMessaging());
      if (!token) {
        console.warn('⚠️ [FCM] Could not get FCM token');
        return null;
      }

      this.fcmToken = token;
      await this.saveToken(token);

      onTokenRefresh(getMessaging(), async (newToken) => {
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
    } catch (err) {
      console.error('❌ [FCM] Failed to save token:', err);
    }
  }

  // Foreground FCM message listener
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

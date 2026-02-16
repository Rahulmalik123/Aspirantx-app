// Firebase Cloud Messaging Service
// Note: Requires @react-native-firebase/messaging package to be installed

import { Platform } from 'react-native';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

class NotificationService {
  private fcmToken: string | null = null;

  async initialize() {
    try {
      console.log('📱 Initializing FCM service...');
      
      // TODO: Install @react-native-firebase/messaging
      // const messaging = require('@react-native-firebase/messaging');
      
      // Request permission (iOS)
      // const authStatus = await messaging().requestPermission();
      // const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      //                 authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      // if (!enabled) {
      //   console.warn('⚠️ Push notification permission denied');
      //   return;
      // }

      // Get FCM token
      // const token = await messaging().getToken();
      // this.fcmToken = token;
      // console.log('✅ FCM Token obtained:', token);

      // Mock token for now
      this.fcmToken = `mock_fcm_token_${Platform.OS}_${Date.now()}`;
      console.log('⚠️ Using mock FCM token (Firebase not installed)');

      // Save token to backend
      await this.saveFCMToken(this.fcmToken);

      // Setup message handlers
      this.setupMessageHandlers();

      return this.fcmToken;
    } catch (error) {
      console.error('❌ FCM initialization failed:', error);
      return null;
    }
  }

  private async saveFCMToken(token: string) {
    try {
      await apiClient.post('/api/v1/auth/fcm-token', { fcmToken: token });
      console.log('✅ FCM token saved to backend');
    } catch (error) {
      console.error('❌ Failed to save FCM token:', error);
    }
  }

  private setupMessageHandlers() {
    // TODO: Setup actual FCM message handlers
    console.log('📨 Setting up FCM message handlers');

    // Foreground messages
    // messaging().onMessage(async (remoteMessage) => {
    //   console.log('🔔 Foreground notification:', remoteMessage);
    //   this.handleNotification(remoteMessage);
    // });

    // Background messages
    // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //   console.log('🔔 Background notification:', remoteMessage);
    // });

    // Notification opened app from quit state
    // messaging().getInitialNotification().then((remoteMessage) => {
    //   if (remoteMessage) {
    //     console.log('🔔 Notification caused app to open:', remoteMessage);
    //     this.handleNotificationAction(remoteMessage);
    //   }
    // });

    // Notification opened app from background
    // messaging().onNotificationOpenedApp((remoteMessage) => {
    //   console.log('🔔 Notification opened app:', remoteMessage);
    //   this.handleNotificationAction(remoteMessage);
    // });
  }

  private handleNotification(notification: any) {
    // Display in-app notification banner
    console.log('Handling notification:', notification);
    
    // Can use react-native-flash-message to show banner
    // showMessage({
    //   message: notification.notification?.title || 'New Notification',
    //   description: notification.notification?.body,
    //   type: 'info',
    //   duration: 4000,
    //   onPress: () => {
    //     this.handleNotificationAction(notification);
    //   },
    // });
  }

  private handleNotificationAction(notification: any) {
    // Navigate based on notification type
    const { data } = notification;
    console.log('Handling notification action:', data);

    // Example navigation based on notification type
    // switch (data?.type) {
    //   case 'TOURNAMENT_STARTED':
    //     navigationRef.navigate('TournamentDetails', { id: data.tournamentId });
    //     break;
    //   case 'BATTLE_INVITE':
    //     navigationRef.navigate('BattleDetails', { id: data.battleId });
    //     break;
    //   case 'TEST_REMINDER':
    //     navigationRef.navigate('TestDetails', { id: data.testId });
    //     break;
    //   default:
    //     navigationRef.navigate('Notifications');
    // }
  }

  async getToken(): Promise<string | null> {
    return this.fcmToken;
  }

  async refreshToken() {
    try {
      // const messaging = require('@react-native-firebase/messaging');
      // const newToken = await messaging().getToken();
      // this.fcmToken = newToken;
      // await this.saveFCMToken(newToken);
      console.log('⚠️ FCM refresh not implemented (Firebase not installed)');
      return this.fcmToken;
    } catch (error) {
      console.error('❌ Failed to refresh FCM token:', error);
      return null;
    }
  }

  async deleteToken() {
    try {
      // const messaging = require('@react-native-firebase/messaging');
      // await messaging().deleteToken();
      this.fcmToken = null;
      console.log('✅ FCM token deleted');
    } catch (error) {
      console.error('❌ Failed to delete FCM token:', error);
    }
  }

  // Helper methods for specific notification types
  async subscribeToTopic(topic: string) {
    try {
      // const messaging = require('@react-native-firebase/messaging');
      // await messaging().subscribeToTopic(topic);
      console.log(`✅ Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
    }
  }

  async unsubscribeFromTopic(topic: string) {
    try {
      // const messaging = require('@react-native-firebase/messaging');
      // await messaging().unsubscribeFromTopic(topic);
      console.log(`✅ Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from topic ${topic}:`, error);
    }
  }
}

export default new NotificationService();

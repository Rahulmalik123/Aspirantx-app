import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import notifee, { EventType } from '@notifee/react-native';
import { RootState } from '../store';
import { ROUTES } from '../constants/routes';
import notificationService, { displayNotification } from '../services/notificationService';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ExamSelectionScreen from '../screens/onboarding/ExamSelectionScreen';

const Stack = createNativeStackNavigator();

// Navigate to the relevant screen based on notification data
function handleNotificationNavigation(data: Record<string, any>, navigation: any) {
  const type: string = data?.type || '';
  const id: string = data?.battleId || data?.tournamentId || data?.testId || data?.postId || '';

  if (type === 'battle' && id) {
    navigation.navigate('BattleResult', { battleId: id });
  } else if (type === 'tournament' && id) {
    navigation.navigate('TournamentDetails', { tournamentId: id });
  } else if (type === 'test_result' && id) {
    navigation.navigate('TestResult', { resultId: id });
  } else if (type === 'social' && id) {
    navigation.navigate('PostDetail', { postId: id });
  } else {
    navigation.navigate('Notifications');
  }
}

const AppNavigator = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    notificationService.initialize().then(() => {
      // Check if app was opened from a killed-state notification tap
      notificationService.getInitialNotification().then((remoteMessage) => {
        if (remoteMessage?.data) {
          handleNotificationNavigation(remoteMessage.data as any, navigation);
        }
      });
    });

    // Foreground FCM: show styled notification via notifee
    const unsubForeground = notificationService.onForegroundMessage(async (remoteMessage) => {
      await displayNotification(remoteMessage);
    });

    // App opened from background via notification tap (FCM)
    const unsubOpened = notificationService.onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        handleNotificationNavigation(remoteMessage.data as any, navigation);
      }
    });

    // Notifee foreground event — notification tap while app is open
    const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data) {
        handleNotificationNavigation(detail.notification.data as any, navigation);
      }
    });

    return () => {
      unsubForeground();
      unsubOpened();
      unsubNotifee();
    };
  }, [isAuthenticated, token]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
        ) : (
          <Stack.Screen name={ROUTES.MAIN} component={MainNavigator} />
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
};

export default AppNavigator;

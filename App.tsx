import React, { useEffect, useRef } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import store, { AppDispatch, RootState } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { checkAuth, logout } from './src/store/slices/authSlice';
import { requestStoragePermissions } from './src/utils/permissions.utils';
import { setLogoutCallback } from './src/api/client';
import notificationService from './src/services/notificationService';

// Navigate to the right screen based on notification data
const handleNotificationNavigation = (
  navRef: React.RefObject<NavigationContainerRef<any> | null>,
  data?: Record<string, string>
) => {
  if (!data || !navRef.current) return;
  const nav = navRef.current as any;

  switch (data.type) {
    case 'BATTLE_CHALLENGE':
    case 'BATTLE_STARTED':
      if (data.battleId) nav.navigate('LiveBattle', { battleId: data.battleId });
      break;
    case 'BATTLE_COMPLETED':
      if (data.battleId) nav.navigate('BattleResult', { battleId: data.battleId });
      break;
    case 'BATTLE_DECLINED':
    case 'BATTLE_CANCELLED':
      nav.navigate('BattleList');
      break;
    default:
      break;
  }
};

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [initializing, setInitializing] = React.useState(true);
  const navRef = useRef<NavigationContainerRef<any> | null>(null);

  useEffect(() => {
    setLogoutCallback(() => {
      dispatch(logout());
    });
  }, [dispatch]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await requestStoragePermissions();
        await dispatch(checkAuth());
      } catch (err) {
        console.error('❌ [App] Auth check error:', err);
      } finally {
        setInitializing(false);
      }
    };
    initAuth();
  }, [dispatch]);

  // Initialize FCM after user is authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    notificationService.initialize();

    // Foreground notification — show a toast
    const unsubForeground = notificationService.onForegroundMessage((msg) => {
      console.log('🔔 [FCM] Foreground:', msg.notification?.title);
      Toast.show({
        type: 'info',
        text1: msg.notification?.title ?? 'Notification',
        text2: msg.notification?.body,
        onPress: () => handleNotificationNavigation(navRef, msg.data as any),
      });
    });

    // Notification tapped while app was backgrounded
    const unsubBackground = notificationService.onNotificationOpenedApp((msg) => {
      console.log('🔔 [FCM] Opened from background:', msg.notification?.title);
      handleNotificationNavigation(navRef, msg.data as any);
    });

    // App opened from quit state via notification
    notificationService.getInitialNotification().then((msg) => {
      if (msg) {
        console.log('🔔 [FCM] Opened from quit state:', msg.notification?.title);
        // Slight delay to let navigation mount
        setTimeout(() => handleNotificationNavigation(navRef, msg.data as any), 1000);
      }
    });

    return () => {
      unsubForeground();
      unsubBackground();
    };
  }, [isAuthenticated]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <AppNavigator />
      <Toast />
    </NavigationContainer>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppContent />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;

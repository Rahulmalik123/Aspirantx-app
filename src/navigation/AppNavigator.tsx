import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../store';
import { ROUTES } from '../constants/routes';
import notificationService from '../services/notificationService';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ExamSelectionScreen from '../screens/onboarding/ExamSelectionScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, token } = useSelector((state: RootState) => state.auth);

  // Initialize FCM notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('📱 Initializing FCM notifications');
      notificationService.initialize().then((fcmToken) => {
        if (fcmToken) {
          console.log('📱 FCM initialized successfully');
        }
      });
    }
  }, [isAuthenticated, token]);

  return (
    <SafeAreaView style={{ flex: 1,backgroundColor:"white" }}>
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

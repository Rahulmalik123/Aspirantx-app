import React, { useEffect } from 'react';
import { StatusBar, ActivityIndicator, View } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import store, { AppDispatch, RootState } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/colors';
import { checkAuth } from './src/store/slices/authSlice';
import { requestStoragePermissions } from './src/utils/permissions.utils';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 [App] Initializing auth check...');
      try {
        // Request storage permissions on startup
        console.log('📱 [App] Requesting storage permissions...');
        await requestStoragePermissions();
        console.log('✅ [App] Storage permissions handled');
        
        await dispatch(checkAuth());
        console.log('✅ [App] Auth check completed');
      } catch (error) {
        console.error('❌ [App] Auth check error:', error);
      } finally {
        console.log('✅ [App] Auth initialization finished');
        setInitializing(false);
      }
    };

    initAuth();
  }, [dispatch]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.white} 
      />
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


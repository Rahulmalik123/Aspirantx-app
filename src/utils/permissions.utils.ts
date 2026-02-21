import { Platform, Alert, Linking } from 'react-native';
import { PERMISSIONS, request, check, RESULTS, requestMultiple } from 'react-native-permissions';

// Show rationale dialog before requesting — returns true if user wants to proceed
const showRationale = (title: string, message: string): Promise<boolean> =>
  new Promise(resolve =>
    Alert.alert(title, message, [
      { text: 'Not Now', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Allow', onPress: () => resolve(true) },
    ])
  );

// Show settings prompt when permission is permanently blocked
const showSettingsPrompt = (title: string, message: string) =>
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Open Settings', onPress: () => Linking.openSettings() },
  ]);

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    // Android < 13 doesn't need explicit notification permission
    // (POST_NOTIFICATIONS constant may not exist on older OS versions)
    if (Platform.OS === 'android' && Platform.Version < 33) {
      return true;
    }

    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.NOTIFICATIONS
        : PERMISSIONS.ANDROID.POST_NOTIFICATIONS;

    if (!permission) {
      return true;
    }

    const status = await check(permission);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.BLOCKED) {
      showSettingsPrompt(
        'Notifications Blocked',
        'You have blocked notifications. Please enable them in app settings to receive battle challenges and results.',
      );
      return false;
    }

    // DENIED or UNDETERMINED — show rationale first
    const proceed = await showRationale(
      'Stay in the Game! 🔔',
      'Allow notifications to get alerts when:\n• Someone challenges you to a battle\n• Your battle result is ready\n• You receive a new achievement',
    );

    if (!proceed) return false;

    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
};

export const requestStoragePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    // For Android 13+ (API 33+)
    const permissions = Platform.Version >= 33 
      ? [
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
          PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
        ]
      : [
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ];

    const results = await requestMultiple(permissions);
    
    const allGranted = Object.values(results).every(
      result => result === RESULTS.GRANTED || result === RESULTS.LIMITED
    );

    if (!allGranted) {
      Alert.alert(
        'Permissions Required',
        'Storage permissions are needed to upload and download files. Please enable them in app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
    
    if (result !== RESULTS.GRANTED) {
      Alert.alert(
        'Camera Permission Required',
        'Camera permission is needed to take photos. Please enable it in app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

export const checkStoragePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permissions = Platform.Version >= 33
      ? [
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
          PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
        ]
      : [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];

    for (const permission of permissions) {
      const result = await check(permission);
      if (result === RESULTS.GRANTED || result === RESULTS.LIMITED) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

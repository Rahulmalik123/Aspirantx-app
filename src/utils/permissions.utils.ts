import { Platform, Alert, Linking } from 'react-native';
import { PERMISSIONS, request, check, RESULTS, requestMultiple } from 'react-native-permissions';

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

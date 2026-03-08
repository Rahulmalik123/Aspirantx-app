import Toast from 'react-native-toast-message';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  Toast.show({
    type: type,
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
  });
};

export const showSuccessToast = (message: string, subtitle?: string) => {
  Toast.show({
    type: 'success',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showErrorToast = (message: string, subtitle?: string) => {
  Toast.show({
    type: 'error',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const showInfoToast = (message: string, subtitle?: string) => {
  Toast.show({
    type: 'info',
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 3000,
  });
};


import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { Alert } from 'react-native';

export interface PickedImage {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export const imagePickerUtils = {
  /**
   * Pick single image from gallery
   */
  pickImageFromGallery: (): Promise<PickedImage | null> => {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1920,
          includeBase64: false,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Failed to pick image');
            resolve(null);
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri!,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || 'image.jpg',
              fileSize: asset.fileSize || 0,
              width: asset.width,
              height: asset.height,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  },

  /**
   * Pick multiple images from gallery
   */
  pickMultipleImages: (maxCount: number = 10): Promise<PickedImage[]> => {
    return new Promise((resolve) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1920,
          selectionLimit: maxCount,
          includeBase64: false,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve([]);
          } else if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Failed to pick images');
            resolve([]);
          } else if (response.assets) {
            const images = response.assets.map(asset => ({
              uri: asset.uri!,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || 'image.jpg',
              fileSize: asset.fileSize || 0,
              width: asset.width,
              height: asset.height,
            }));
            resolve(images);
          } else {
            resolve([]);
          }
        }
      );
    });
  },

  /**
   * Take photo from camera
   */
  takePhoto: (): Promise<PickedImage | null> => {
    return new Promise((resolve) => {
      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1920,
          maxHeight: 1920,
          includeBase64: false,
          saveToPhotos: true,
        },
        (response: ImagePickerResponse) => {
          if (response.didCancel) {
            resolve(null);
          } else if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Failed to take photo');
            resolve(null);
          } else if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            resolve({
              uri: asset.uri!,
              type: asset.type || 'image/jpeg',
              fileName: asset.fileName || 'photo.jpg',
              fileSize: asset.fileSize || 0,
              width: asset.width,
              height: asset.height,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  },

  /**
   * Show action sheet to choose between camera and gallery
   */
  showImagePickerOptions: (): Promise<PickedImage | null> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const result = await imagePickerUtils.takePhoto();
              resolve(result);
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const result = await imagePickerUtils.pickImageFromGallery();
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true }
      );
    });
  },
};

export default imagePickerUtils;

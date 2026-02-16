import * as DocumentPicker from '@react-native-documents/picker';
import { Alert, Platform } from 'react-native';

export interface PickedDocument {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export const documentPickerUtils = {
  /**
   * Pick single document (PDF)
   */
  pickDocument: async (): Promise<PickedDocument | null> => {
    try {
      console.log('📄 [DocumentPicker] Starting PDF selection...');
      
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });

      console.log('📄 [DocumentPicker] Selected file:', results);

      if (!results || results.length === 0) {
        return null;
      }

      const result = results[0];

      return {
        uri: result.fileCopyUri || result.uri,
        type: result.type || 'application/pdf',
        name: result.name || 'document.pdf',
        size: result.size || 0,
      };
    } catch (err: any) {
      console.error('❌ [DocumentPicker] Error:', err);
      console.error('❌ [DocumentPicker] Error code:', err?.code);
      
      // User cancelled
      if (DocumentPicker.isCancel(err)) {
        console.log('ℹ️ [DocumentPicker] User cancelled selection');
        return null;
      }

      Alert.alert('Error', 'Failed to pick document');
      return null;
    }
  },

  /**
   * Pick PDF only
   */
  pickPDF: async (): Promise<PickedDocument | null> => {
    return documentPickerUtils.pickDocument();
  },

  /**
   * Pick any file type
   */
  pickAnyFile: async (): Promise<PickedDocument | null> => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.allFiles,
        copyTo: 'cachesDirectory',
      });

      return {
        uri: result.fileCopyUri || result.uri,
        type: result.type || 'application/octet-stream',
        name: result.name || 'file',
        size: result.size || 0,
      };
    } catch (err: any) {
      console.error('Document picker error:', err);
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        return null;
      }
      Alert.alert('Error', 'Failed to pick file');
      return null;
    }
  },

  /**
   * Pick multiple documents
   */
  pickMultipleDocuments: async (): Promise<PickedDocument[]> => {
    try {
      const results = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        allowMultiSelection: true,
        copyTo: 'cachesDirectory',
      });

      return results.map(result => ({
        uri: result.fileCopyUri || result.uri,
        type: result.type || 'application/pdf',
        name: result.name || 'document.pdf',
        size: result.size || 0,
      }));
    } catch (err: any) {
      console.error('Document picker error:', err);
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        return [];
      }
      Alert.alert('Error', 'Failed to pick documents');
      return [];
    }
  },
};

export default documentPickerUtils;


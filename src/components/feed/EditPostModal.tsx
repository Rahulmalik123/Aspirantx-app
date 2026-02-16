import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { Post } from '../../types/social.types';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { uploadService } from '../../api/services/upload.service';

interface EditPostModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  onSubmit: (postId: string, postData: { content: string; hashtags?: string[]; images?: string[] }) => Promise<void>;
}

const EditPostModal: React.FC<EditPostModalProps> = ({
  visible,
  post,
  onClose,
  onSubmit,
}) => {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (post && visible) {
      setContent(post.content || '');
      setHashtags(post.hashtags ? post.hashtags.map(tag => `#${tag}`).join(' ') : '');
      setSelectedImages(post.images || []);
    }
  }, [post, visible]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (!post) return;

    try {
      setLoading(true);

      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.trim().startsWith('#'))
        .map(tag => tag.trim().replace('#', ''));

      const postData = {
        content: content.trim(),
        hashtags: hashtagArray.length > 0 ? hashtagArray : undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      };

      await onSubmit(post._id, postData);
      
      // Reset form
      setContent('');
      setHashtags('');
      setSelectedImages([]);
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      Alert.alert('Error', 'Failed to update post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async () => {
    try {
      const images = await imagePickerUtils.pickMultipleImages(5 - selectedImages.length);
      
      if (images && images.length > 0) {
        setUploadingImages(true);
        
        try {
          const response = await uploadService.uploadPostImages(images);
          
          if (response.success && response.data) {
            const uploadedUrls = response.data.map((item: any) => item.url);
            setSelectedImages(prev => [...prev, ...uploadedUrls]);
          }
        } catch (error) {
          console.error('Error uploading images:', error);
          Alert.alert('Error', 'Failed to upload images. Please try again.');
        } finally {
          setUploadingImages(false);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!visible || !post) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.headerButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Post</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.headerButton, styles.postButton]}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postText}>Update</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Text Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#999"
                multiline
                value={content}
                onChangeText={setContent}
                autoFocus
                maxLength={1000}
              />
              <Text style={styles.characterCount}>{content.length}/1000</Text>
            </View>

            {/* Hashtags Input */}
            <View style={styles.hashtagsContainer}>
              <Icon name="pricetag-outline" size={20} color="#666" />
              <TextInput
                style={styles.hashtagsInput}
                placeholder="Add hashtags (e.g., #motivation #study)"
                placeholderTextColor="#999"
                value={hashtags}
                onChangeText={setHashtags}
              />
            </View>

            {/* Selected Images */}
            {selectedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesTitle}>Images ({selectedImages.length}/5)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: image }} style={styles.selectedImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Icon name="close-circle" size={24} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <Text style={styles.actionsTitle}>Add to your post</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleAddImage}
                  disabled={uploadingImages || selectedImages.length >= 5}
                >
                  {uploadingImages ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <>
                      <Icon 
                        name="image-outline" 
                        size={24} 
                        color={selectedImages.length >= 5 ? '#ccc' : COLORS.primary} 
                      />
                      <Text 
                        style={[
                          styles.actionButtonText,
                          selectedImages.length >= 5 && styles.actionButtonTextDisabled
                        ]}
                      >
                        Photo
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    minWidth: 60,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  postText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  textInput: {
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  hashtagsInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
  },
  imagesContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  imagesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  imageWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  actionsContainer: {
    padding: 16,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButtonTextDisabled: {
    color: '#ccc',
  },
});

export default EditPostModal;

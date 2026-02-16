import React, { useState } from 'react';
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
import { CreatePostRequest } from '../../types/social.types';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { uploadService } from '../../api/services/upload.service';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (postData: CreatePostRequest) => Promise<void>;
  userAvatar?: string;
  userName?: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userAvatar,
  userName,
}) => {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [postType, setPostType] = useState<'text' | 'image' | 'poll'>('text');
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [pollDuration, setPollDuration] = useState(24); // hours

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('Content:', content);
    console.log('Content trimmed:', content.trim());
    
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    // Validate poll if type is poll
    if (postType === 'poll') {
      if (!pollQuestion.trim()) {
        Alert.alert('Error', 'Please enter a poll question');
        return;
      }
      const validOptions = pollOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        Alert.alert('Error', 'Please add at least 2 poll options');
        return;
      }
    }

    try {
      setLoading(true);
      console.log('Creating post...');

      const hashtagArray = hashtags
        .split(' ')
        .filter(tag => tag.trim().startsWith('#'))
        .map(tag => tag.trim().replace('#', ''));

      // Determine final post type
      let finalType = postType;
      
      // If poll data exists, force type to be 'poll'
      if (postType === 'poll' && pollQuestion.trim() && pollOptions.filter(opt => opt.trim()).length >= 2) {
        finalType = 'poll';
      } else if (selectedImages.length > 0) {
        finalType = 'image';
      }

      // Normalize multiple spaces to single space
      const normalizedContent = content.replace(/\s+/g, ' ').trim();

      const postData: CreatePostRequest = {
        content: normalizedContent,
        type: finalType,
        hashtags: hashtagArray.length > 0 ? hashtagArray : undefined,
        images: selectedImages.length > 0 ? selectedImages : undefined,
      };

      // Add poll data if type is poll
      if (finalType === 'poll') {
        const validOptions = pollOptions.filter(opt => opt.trim());
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + pollDuration);
        
        postData.poll = {
          question: pollQuestion.trim(),
          options: validOptions.map(opt => ({
            text: opt.trim(),
            votes: 0,
          })),
          expiresAt: expiresAt.toISOString(),
        };
      }

      console.log('Post data:', postData);
      await onSubmit(postData);
      
      console.log('Post created successfully');
      // Reset form
      setContent('');
      setHashtags('');
      setSelectedImages([]);
      setPostType('text');
      setPollQuestion('');
      setPollOptions(['', '']);
      setPollDuration(24);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
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
          // Upload images to Cloudinary
          const response = await uploadService.uploadPostImages(images);
          
          if (response.success && response.data) {
            const uploadedUrls = response.data.map((item: any) => item.url);
            setSelectedImages(prev => [...prev, ...uploadedUrls]);
            setPostType('image');
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

  console.log('CreatePostModal render, visible:', visible);

  if (!visible) {
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
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.headerButton, styles.postButton]}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.postText,
                  (!content.trim() || loading) && styles.postTextDisabled,
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* User Info */}
          <View style={styles.userSection}>
            <Image
              source={{
                uri: userAvatar || 'https://via.placeholder.com/40',
              }}
              style={styles.avatar}
            />
            <Text style={styles.userName}>{userName || 'User'}</Text>
          </View>

          {/* Post Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                postType === 'text' && styles.typeButtonActive,
              ]}
              onPress={() => setPostType('text')}
            >
              <Icon 
                name="document-text-outline" 
                size={18} 
                color={postType === 'text' ? '#FFFFFF' : '#666'} 
              />
              <Text
                style={[
                  styles.typeButtonText,
                  postType === 'text' && styles.typeButtonTextActive,
                ]}
              >
                Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                postType === 'image' && styles.typeButtonActive,
              ]}
              onPress={() => setPostType('image')}
            >
              <Icon 
                name="image-outline" 
                size={18} 
                color={postType === 'image' ? '#FFFFFF' : '#666'} 
              />
              <Text
                style={[
                  styles.typeButtonText,
                  postType === 'image' && styles.typeButtonTextActive,
                ]}
              >
                Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                postType === 'poll' && styles.typeButtonActive,
              ]}
              onPress={() => setPostType('poll')}
            >
              <Icon 
                name="bar-chart-outline" 
                size={18} 
                color={postType === 'poll' ? '#FFFFFF' : '#666'} 
              />
              <Text
                style={[
                  styles.typeButtonText,
                  postType === 'poll' && styles.typeButtonTextActive,
                ]}
              >
                Poll
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={1000}
            autoFocus
          />

          <Text style={styles.characterCount}>
            {content.length}/1000
          </Text>

          {/* Images Section */}
          {postType === 'image' && (
            <View style={styles.imagesSection}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleAddImage}
              >
                <Icon name="camera-outline" size={24} color={COLORS.primary} />
                <Text style={styles.addImageText}>Add Images</Text>
              </TouchableOpacity>

              {selectedImages.length > 0 && (
                <ScrollView horizontal style={styles.imagePreviewContainer}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image source={{ uri: image }} style={styles.previewImage} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Icon name="close" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Poll Section */}
          {postType === 'poll' && (
            <View style={styles.pollSection}>
              <Text style={styles.sectionLabel}>Poll Question</Text>
              <TextInput
                style={styles.pollQuestionInput}
                placeholder="Ask a question..."
                placeholderTextColor="#999"
                value={pollQuestion}
                onChangeText={setPollQuestion}
                maxLength={200}
              />

              <Text style={styles.sectionLabel}>Poll Options</Text>
              {pollOptions.map((option, index) => (
                <View key={index} style={styles.pollOptionRow}>
                  <TextInput
                    style={styles.pollOptionInput}
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor="#999"
                    value={option}
                    onChangeText={(text) => {
                      const newOptions = [...pollOptions];
                      newOptions[index] = text;
                      setPollOptions(newOptions);
                    }}
                    maxLength={100}
                  />
                  {pollOptions.length > 2 && (
                    <TouchableOpacity
                      onPress={() => {
                        const newOptions = pollOptions.filter((_, i) => i !== index);
                        setPollOptions(newOptions);
                      }}
                      style={styles.removeOptionButton}
                    >
                      <Icon name="close-circle" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {pollOptions.length < 6 && (
                <TouchableOpacity
                  style={styles.addOptionButton}
                  onPress={() => setPollOptions([...pollOptions, ''])}
                >
                  <Icon name="add-circle-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.addOptionText}>Add Option</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.sectionLabel}>Poll Duration</Text>
              <View style={styles.durationContainer}>
                {[24, 48, 72, 168].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    style={[
                      styles.durationButton,
                      pollDuration === hours && styles.durationButtonActive,
                    ]}
                    onPress={() => setPollDuration(hours)}
                  >
                    <Text
                      style={[
                        styles.durationButtonText,
                        pollDuration === hours && styles.durationButtonTextActive,
                      ]}
                    >
                      {hours === 24 ? '1 Day' : hours === 48 ? '2 Days' : hours === 72 ? '3 Days' : '1 Week'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Hashtags Input */}
          <View style={styles.hashtagSection}>
            <Text style={styles.sectionLabel}>Hashtags (optional)</Text>
            <TextInput
              style={styles.hashtagInput}
              placeholder="#study #motivation #upsc"
              placeholderTextColor="#999"
              value={hashtags}
              onChangeText={setHashtags}
            />
            <Text style={styles.hashtagHint}>
              Separate hashtags with spaces
            </Text>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  postText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  contentInput: {
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 22,
    color: '#1A1A1A',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  imagesSection: {
    padding: 16,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginRight: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashtagSection: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  hashtagInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  hashtagHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  pollSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pollQuestionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pollOptionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
  },
  removeOptionButton: {
    marginLeft: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 16,
  },
  addOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  durationButtonTextActive: {
    color: '#FFFFFF',
  },
});

export default CreatePostModal;

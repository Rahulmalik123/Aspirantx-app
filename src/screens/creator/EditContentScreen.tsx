import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomIcon from '../../components/CustomIcon';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { showMessage } from 'react-native-flash-message';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { documentPickerUtils } from '../../utils/documentPicker.utils';
import contentService from '../../api/services/contentService';

const EditContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { contentId } = route.params as { contentId: string };
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contentType: 'pdf',
    category: 'Notes',
    tags: '',
    exams: [] as string[],
    isFree: false,
  });
  const [existingThumbnail, setExistingThumbnail] = useState<string>('');
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

  const contentTypes = [
    {label: 'PDF Notes', value: 'pdf', icon: 'file-pdf-box'},
    {label: 'Video', value: 'video', icon: 'video'},
    {label: 'eBook', value: 'ebook', icon: 'book-open-variant'},
    {label: 'Study Notes', value: 'notes', icon: 'notebook'},
    {label: 'Practice Set', value: 'practice_set', icon: 'pencil'},
  ];
  const categories = ['Notes', 'Test Series', 'Mock Tests', 'Study Material'];
  
  useEffect(() => {
    fetchExams();
    fetchContentDetails();
  }, []);
  
  const fetchContentDetails = async () => {
    try {
      setInitialLoading(true);
      const response = await contentService.getContentDetails(contentId);
      // The API returns { success, message, data: { content, reviews } }
      const content = response.data?.content || response.content;
      
      if (!content) {
        throw new Error('Content not found');
      }
      
      console.log('📝 [Edit Content] Loaded content:', {
        category: content.category,
        contentType: content.contentType || content.type
      });
      
      // Populate form with existing data
      setFormData({
        title: content.title || '',
        description: content.description || '',
        price: content.isFree ? '' : (content.pricing?.originalPrice || content.price || 0).toString(),
        contentType: content.contentType || content.type || 'pdf',
        category: "Notes" ,
        tags: content.tags?.join(', ') || '',
        exams: content.targetExams?.map((e: any) => e._id || e) || 
               (content.exam?._id ? [content.exam._id] : []),
        isFree: content.isFree || false,
      });
      
      setExistingThumbnail(content.thumbnail || '');
      setExistingFiles(content.files || []);
    } catch (error) {
      console.error('Failed to fetch content details:', error);
      Alert.alert('Error', 'Failed to load content details');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };
  
  const fetchExams = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.EXAMS);
      if (response.data?.data) {
        setAvailableExams(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      setAvailableExams([
        { _id: 'upsc', name: 'UPSC' },
        { _id: 'ssc', name: 'SSC' },
        { _id: 'banking', name: 'Banking' },
        { _id: 'railways', name: 'Railways' },
        { _id: 'teaching', name: 'Teaching' },
      ]);
    }
  };

  const handlePickFile = async () => {
    try {
      setUploadingFile(true);
      
      const result = await documentPickerUtils.pickDocument();
      if (!result) {
        setUploadingFile(false);
        return;
      }

      setSelectedFile(result);
      showMessage({
        message: 'File selected',
        description: `${result.name}`,
        type: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error picking file:', error);
      if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', error.message || 'Failed to select file');
      }
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePickThumbnail = async () => {
    try {
      setUploadingThumbnail(true);
      
      const result = await imagePickerUtils.pickImageFromGallery();
      if (!result) {
        setUploadingThumbnail(false);
        return;
      }

      setThumbnail(result);
      showMessage({
        message: 'Thumbnail selected',
        type: 'success',
        duration: 2000,
      });
    } catch (error: any) {
      console.error('Error picking thumbnail:', error);
      Alert.alert('Error', error.message || 'Failed to select thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const toggleExam = (examId: string) => {
    if (formData.exams.includes(examId)) {
      setFormData({ ...formData, exams: formData.exams.filter(e => e !== examId) });
    } else {
      setFormData({ ...formData, exams: [...formData.exams, examId] });
    }
  };

  const handleUpdate = async () => {
    // Validation
    if (!formData.title.trim()) {
      Alert.alert('Missing Information', 'Please enter a title for your content');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Missing Information', 'Please add a description');
      return;
    }
    if (!formData.isFree && (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0)) {
      Alert.alert('Invalid Price', 'Please enter a valid price or mark as free');
      return;
    }
    if (!formData.category) {
      Alert.alert('Missing Information', 'Please select a category');
      return;
    }
    if (formData.exams.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one exam');
      return;
    }

    try {
      setLoading(true);

      // Check if we need to use FormData (only if files are being uploaded)
      const hasNewFiles = selectedFile || thumbnail;
      
      if (hasNewFiles) {
        // Use FormData for file uploads
        const formDataToSend = new FormData();
        
        // Add text fields
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.isFree ? '0' : formData.price);
        formDataToSend.append('contentType', formData.contentType);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('tags', formData.tags);
        formDataToSend.append('exams', JSON.stringify(formData.exams));
        formDataToSend.append('isFree', formData.isFree.toString());
        
        // Add new content file if selected
        if (selectedFile) {
          formDataToSend.append('contentFile', {
            uri: selectedFile.uri,
            type: selectedFile.type || 'application/pdf',
            name: selectedFile.name || 'content.pdf',
          } as any);
        }
        
        // Add new thumbnail if selected
        if (thumbnail) {
          formDataToSend.append('thumbnail', {
            uri: thumbnail.uri,
            type: thumbnail.type || 'image/jpeg',
            name: thumbnail.fileName || 'thumbnail.jpg',
          } as any);
        }

        console.log('📤 [Update] Updating content with files...');

        const response = await apiClient.put(
          ENDPOINTS.UPDATE_CONTENT(contentId), 
          formDataToSend, 
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data?.success || response.data) {
          showMessage({
            message: 'Success!',
            description: 'Content updated successfully.',
            type: 'success',
            duration: 3000,
          });
          navigation.goBack();
        }
      } else {
        // Use regular JSON for text-only updates
        const updateData = {
          title: formData.title,
          description: formData.description,
          price: formData.isFree ? 0 : Number(formData.price),
          contentType: formData.contentType,
          category: formData.category,
          tags: formData.tags,
          exams: formData.exams,
          isFree: formData.isFree,
        };

        console.log('📤 [Update] Updating content (text only)...');

        const response = await contentService.updateContent(contentId, updateData);

        if (response) {
          showMessage({
            message: 'Success!',
            description: 'Content updated successfully.',
            type: 'success',
            duration: 3000,
          });
          navigation.goBack();
        }
      }
    } catch (error: any) {
      console.error('Update failed:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to update content. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <CustomIcon name="arrow-left" size={24} color="#1F2937" type="material-community" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Content</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Content Type *</Text>
          <View style={styles.chipsContainer}>
            {contentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.chip,
                  formData.contentType === type.value && styles.chipSelected
                ]}
                onPress={() => setFormData({ ...formData, contentType: type.value })}
              >
                <CustomIcon
                  name={type.icon}
                  size={16}
                  color={formData.contentType === type.value ? '#6366F1' : '#6B7280'}
                  type="material-community"
                />
                <Text style={[
                  styles.chipText,
                  formData.contentType === type.value && styles.chipTextSelected
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Title *</Text>
            <Text style={styles.charCount}>{formData.title.length}/80</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="e.g., UPSC Prelims 2024 Complete Notes"
            placeholderTextColor="#9CA3AF"
            value={formData.title}
            onChangeText={(text) => {
              if (text.length <= 80) {
                setFormData({ ...formData, title: text });
              }
            }}
            maxLength={80}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description *</Text>
            <Text style={styles.charCount}>{formData.description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your content in detail..."
            placeholderTextColor="#9CA3AF"
            value={formData.description}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setFormData({ ...formData, description: text });
              }
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Pricing *</Text>
          <View style={styles.pricingContainer}>
            <TouchableOpacity
              style={[
                styles.freeToggle,
                formData.isFree && styles.freeToggleActive
              ]}
              onPress={() => setFormData({ ...formData, isFree: !formData.isFree })}
            >
              <CustomIcon
                name={formData.isFree ? "checkbox-marked" : "checkbox-blank-outline"}
                size={20}
                color={formData.isFree ? "#6366F1" : "#9CA3AF"}
                type="material-community"
              />
              <Text style={[
                styles.freeText,
                formData.isFree && styles.freeTextActive
              ]}>
                Free Content
              </Text>
            </TouchableOpacity>
            
            {!formData.isFree && (
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="99"
                  placeholderTextColor="#9CA3AF"
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.chipsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  formData.category === cat && styles.chipSelected
                ]}
                onPress={() => setFormData({ ...formData, category: cat })}
              >
                <Text style={[
                  styles.chipText,
                  formData.category === cat && styles.chipTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Exams */}
        <View style={styles.section}>
          <Text style={styles.label}>Target Exams *</Text>
          <Text style={styles.helperText}>Select exams this content is for</Text>
          <View style={styles.chipsContainer}>
            {availableExams.map((exam) => (
              <TouchableOpacity
                key={exam._id}
                style={[
                  styles.chip,
                  formData.exams.includes(exam._id) && styles.chipSelected
                ]}
                onPress={() => toggleExam(exam._id)}
              >
                <Text style={[
                  styles.chipText,
                  formData.exams.includes(exam._id) && styles.chipTextSelected
                ]}>
                  {exam.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>Tags (Optional)</Text>
          <Text style={styles.helperText}>Comma separated, e.g., history, geography</Text>
          <TextInput
            style={styles.input}
            placeholder="Add tags to help users find your content"
            placeholderTextColor="#9CA3AF"
            value={formData.tags}
            onChangeText={(text) => setFormData({ ...formData, tags: text })}
          />
        </View>

        {/* Replace Content File */}
        <View style={styles.section}>
          <Text style={styles.label}>Content File (Optional - leave empty to keep existing)</Text>
          
          {/* Show existing files if any */}
          {!selectedFile && existingFiles.length > 0 && (
            <View style={styles.existingFilesContainer}>
              <Text style={styles.existingFilesLabel}>Current Files:</Text>
              {existingFiles.map((file, index) => (
                <View key={index} style={styles.existingFileItem}>
                  <CustomIcon
                    name="file-document"
                    size={20}
                    color="#6366F1"
                    type="material-community"
                  />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>
                      {file.format?.toUpperCase() || 'File'} - {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </View>
                  <CustomIcon
                    name="check-circle"
                    size={20}
                    color="#10B981"
                    type="material-community"
                  />
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickFile}
            disabled={uploadingFile}
          >
            <CustomIcon
              name={selectedFile ? "check-circle" : "cloud-upload"}
              size={24}
              color={selectedFile ? "#10B981" : "#6366F1"}
              type="material-community"
            />
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadButtonText}>
                {selectedFile ? selectedFile.name : existingFiles.length > 0 ? 'Replace Content File' : 'Upload Content File'}
              </Text>
              <Text style={styles.uploadButtonSubtext}>
                {selectedFile ? 'File selected' : 'PDF, Video, or other supported formats'}
              </Text>
            </View>
            {uploadingFile && <ActivityIndicator size="small" color="#6366F1" />}
          </TouchableOpacity>
        </View>

        {/* Replace Thumbnail */}
        <View style={styles.section}>
          <Text style={styles.label}>Thumbnail (Optional - leave empty to keep existing)</Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handlePickThumbnail}
            disabled={uploadingThumbnail}
          >
            {thumbnail ? (
              <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailPreview} />
            ) : existingThumbnail ? (
              <Image source={{ uri: existingThumbnail }} style={styles.thumbnailPreview} />
            ) : (
              <CustomIcon
                name="image"
                size={24}
                color="#6366F1"
                type="material-community"
              />
            )}
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadButtonText}>
                {thumbnail ? 'New thumbnail selected' : existingThumbnail ? 'Replace Thumbnail' : 'Select Thumbnail'}
              </Text>
              <Text style={styles.uploadButtonSubtext}>JPG, PNG (Recommended: 800x600)</Text>
            </View>
            {uploadingThumbnail && <ActivityIndicator size="small" color="#6366F1" />}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <CustomIcon name="check" size={20} color="#FFF" type="material-community" />
              <Text style={styles.submitButtonText}>Update Content</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: 16,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  pricingContainer: {
    gap: 12,
  },
  freeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  freeToggleActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  freeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  freeTextActive: {
    color: '#6366F1',
    fontWeight: '500',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    gap: 12,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  existingFilesContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  existingFilesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  existingFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 6,
    marginTop: 6,
    gap: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  thumbnailPreview: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default EditContentScreen;

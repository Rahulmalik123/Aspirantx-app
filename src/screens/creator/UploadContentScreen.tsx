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
import { useNavigation } from '@react-navigation/native';
import CustomIcon from '../../components/CustomIcon';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { COLORS } from '../../constants/colors';
import { showMessage } from 'react-native-flash-message';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { documentPickerUtils } from '../../utils/documentPicker.utils';
import { uploadService } from '../../api/services/upload.service';

const UploadContentScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [thumbnail, setThumbnail] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    contentType: 'pdf', // Set default to PDF
    category: '',
    tags: '',
    exams: [] as string[],
    isFree: false,
  });

  const contentTypes = [
    {label: 'PDF Notes', value: 'pdf', icon: 'file-pdf-box'},
  ];
  const categories = ['Notes', 'Test Series', /* 'PYQ', */ 'Mock Tests', 'Study Material'];
  
  useEffect(() => {
    fetchExams();
  }, []);
  
  const fetchExams = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.EXAMS);
      if (response.data?.data) {
        setAvailableExams(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      // Fallback to hardcoded if API fails
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
      
      // Pick document
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
      
      // Pick image from gallery
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

  const handleUpload = async () => {
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
    if (!selectedFile) {
      Alert.alert('Missing File', 'Please select your content file');
      return;
    }
    if (formData.exams.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one exam');
      return;
    }

    try {
      setLoading(true);

      // Create FormData to send files with content data
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
      
      // Add content file
      formDataToSend.append('contentFile', {
        uri: selectedFile.uri,
        type: selectedFile.type || 'application/pdf',
        name: selectedFile.name || 'content.pdf',
      } as any);
      
      // Add thumbnail if selected
      if (thumbnail) {
        formDataToSend.append('thumbnail', {
          uri: thumbnail.uri,
          type: thumbnail.type || 'image/jpeg',
          name: thumbnail.fileName || 'thumbnail.jpg',
        } as any);
      }

      console.log('📤 [Upload] Uploading content with files...');

      const response = await apiClient.post(ENDPOINTS.UPLOAD_CONTENT, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success || response.success) {
        showMessage({
          message: 'Success!',
          description: 'Content uploaded successfully. Pending admin approval.',
          type: 'success',
          duration: 3000,
        });
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Check if error is because user is not a creator
      if (error.message === 'Only creators can upload content') {
        Alert.alert(
          'Become a Creator',
          'You need to register as a creator to upload content. Would you like to register now?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Register as Creator',
              onPress: () => navigation.navigate('BecomeCreator' as never)
            }
          ]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || error.message || 'Failed to upload content. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <CustomIcon name="arrow-left" size={24} color="#1F2937" type="material-community" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Content</Text>
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
                  color={formData.contentType === type.value ? 'COLORS.primary' : '#6B7280'}
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
            style={styles.textArea}
            placeholder="Describe what's included, topics covered, target audience, etc.\n\nExample: Complete notes for UPSC Prelims 2024 covering History, Geography, and Polity. Includes 200+ pages of well-organized content with diagrams and practice questions."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={formData.description}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setFormData({ ...formData, description: text });
              }
            }}
            maxLength={500}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Pricing *</Text>
            <TouchableOpacity
              style={styles.freeToggle}
              onPress={() => setFormData({...formData, isFree: !formData.isFree, price: formData.isFree ? '' : '0'})}>
              <CustomIcon
                name={formData.isFree ? 'check-circle' : 'circle-outline'}
                size={18}
                color={formData.isFree ? '#10B981' : '#9CA3AF'}
                type="material-community"
              />
              <Text style={[styles.freeToggleText, formData.isFree && styles.freeToggleTextActive]}>
                Make it Free
              </Text>
            </TouchableOpacity>
          </View>
          
          {!formData.isFree && (
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Enter amount (e.g., 99, 199, 499)"
                placeholderTextColor="#9CA3AF"
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                keyboardType="numeric"
              />
            </View>
          )}
          
          {!formData.isFree && formData.price && (
            <View style={styles.earningInfo}>
              <CustomIcon name="information-outline" size={16} color="COLORS.primary" type="material-community" />
              <Text style={styles.earningText}>
                You'll earn ₹{(Number(formData.price) * 0.7).toFixed(0)} (70%) per sale
              </Text>
            </View>
          )}
          
          {formData.isFree && (
            <View style={styles.freeNote}>
              <CustomIcon name="gift-outline" size={20} color="#10B981" type="material-community" />
              <Text style={styles.freeNoteText}>
                Free content helps build your audience and reputation!
              </Text>
            </View>
          )}
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

        {/* Exams */}
        <View style={styles.section}>
          <Text style={styles.label}>Relevant Exams *</Text>
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
          <TextInput
            style={styles.input}
            placeholder="history, geography, prelims, 2024"
            placeholderTextColor="#9CA3AF"
            value={formData.tags}
            onChangeText={(text) => setFormData({ ...formData, tags: text })}
          />
          <Text style={styles.helperText}>
            Separate tags with commas to help users find your content
          </Text>
        </View>

        {/* File Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Content File (PDF) *</Text>
          <TouchableOpacity 
            style={styles.fileButton} 
            onPress={handlePickFile}
            disabled={uploadingFile}
          >
            {uploadingFile ? (
              <ActivityIndicator size="small" color="COLORS.primary" />
            ) : (
              <CustomIcon name="file-pdf-box" size={24} color="COLORS.primary" type="material-community" />
            )}
            <Text style={styles.fileButtonText}>
              {uploadingFile ? 'Uploading...' : selectedFile ? selectedFile.name : 'Choose PDF File'}
            </Text>
            {selectedFile && !uploadingFile && (
              <Text style={styles.fileSize}>
                {((selectedFile.size || 0) / 1024).toFixed(0)} KB
              </Text>
            )}
          </TouchableOpacity>
          {fileUrl && (
            <View style={styles.uploadSuccessContainer}>
              <CustomIcon name="check-circle" size={16} color="#10B981" type="material-community" />
              <Text style={styles.uploadSuccessText}>File uploaded to cloud</Text>
            </View>
          )}
        </View>

        {/* Thumbnail Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>Thumbnail (Optional)</Text>
          <TouchableOpacity 
            style={styles.fileButton} 
            onPress={handlePickThumbnail}
            disabled={uploadingThumbnail}
          >
            {uploadingThumbnail ? (
              <ActivityIndicator size="small" color="COLORS.primary" />
            ) : thumbnail ? (
              <Image source={{ uri: thumbnail.uri }} style={styles.thumbnailPreview} />
            ) : (
              <CustomIcon name="image" size={24} color="COLORS.primary" type="material-community" />
            )}
            <Text style={styles.fileButtonText}>
              {uploadingThumbnail ? 'Uploading...' : thumbnail ? thumbnail.fileName || 'Thumbnail' : 'Choose Image'}
            </Text>
          </TouchableOpacity>
          {thumbnailUrl && (
            <View style={styles.uploadSuccessContainer}>
              <CustomIcon name="check-circle" size={16} color="#10B981" type="material-community" />
              <Text style={styles.uploadSuccessText}>Thumbnail uploaded to cloud</Text>
            </View>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadButton, loading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <CustomIcon name="cloud-upload" size={20} color="#FFFFFF" type="material-community" />
              <Text style={styles.uploadButtonText}>Upload Content</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.note}>
          <CustomIcon name="information-outline" size={18} color="#6B7280" type="material-community" />
          <Text style={styles.noteText}>
            Your content will be reviewed before publishing. You'll earn 70% of each sale.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
    marginTop: 6,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: 'COLORS.primary',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: 'COLORS.primary',
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
    minHeight: 120,
  },
  freeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freeToggleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  freeToggleTextActive: {
    color: '#10B981',
    fontWeight: '600',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: 'COLORS.primary',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  earningInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  earningText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  freeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  freeNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#065F46',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: 'COLORS.primary',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: 'COLORS.primary',
    fontWeight: '600',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  fileButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#6B7280',
  },
  fileSize: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  thumbnailPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  uploadSuccessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  uploadSuccessText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: 'COLORS.primary',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 40,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#4F46E5',
    lineHeight: 18,
  },
});

export default UploadContentScreen;

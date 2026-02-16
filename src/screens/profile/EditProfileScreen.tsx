import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { uploadService } from '../../api/services/upload.service';
import userService from '../../api/services/userService';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../../components/common/Header';

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const formatDateFromISO = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return '';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth ? formatDateFromISO(user.dateOfBirth) : '',
    gender: user?.gender || '',
    state: user?.state || '',
    city: user?.city || '',
  });

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Initialize selected date from user's existing date of birth
  const getInitialDate = () => {
    if (user?.dateOfBirth) {
      const date = new Date(user.dateOfBirth);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  };
  
  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());

  const genderOptions = ['male', 'female', 'other'];

  // Update avatar when user data changes
  useEffect(() => {
    console.log('User data:', user);
    console.log('Current avatar state:', avatar);
    if (user?.avatar) {
      console.log('Setting avatar from user:', user.avatar);
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleChangeAvatar = async () => {
    try {
      const image = await imagePickerUtils.showImagePickerOptions();

      if (image) {
        setUploadingAvatar(true);

        try {
          const response = await uploadService.uploadProfilePicture(image);

          if (response.success && response.data) {
            setAvatar(response.data.url);
            Alert.alert('Success', 'Profile picture updated!');
          }
        } catch (error) {
          console.error('Error uploading avatar:', error);
          Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
        } finally {
          setUploadingAvatar(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
      };

      if (formData.email) {
        updateData.email = formData.email;
      }

      if (formData.gender) {
        updateData.gender = formData.gender;
      }

      if (formData.state) {
        updateData.state = formData.state;
      }

      if (formData.city) {
        updateData.city = formData.city;
      }

      if (formData.dateOfBirth) {
        // Convert DD/MM/YYYY to ISO date format for backend
        const parts = formData.dateOfBirth.split('/');
        if (parts.length === 3) {
          const isoDate = new Date(
            parseInt(parts[2]), // year
            parseInt(parts[1]) - 1, // month (0-indexed)
            parseInt(parts[0]) // day
          ).toISOString();
          updateData.dateOfBirth = isoDate;
        }
      }

      if (avatar !== user?.avatar) {
        updateData.avatar = avatar;
      }

      // Update via Redux to sync with global state
      await dispatch(updateProfile(updateData)).unwrap();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert(
        'Error',
        error?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDate(date);
      updateFormData('dateOfBirth', formattedDate);
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const openDatePicker = () => {
    // If there's already a date, parse it
    if (formData.dateOfBirth) {
      const parts = formData.dateOfBirth.split('/');
      if (parts.length === 3) {
        const parsedDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
        if (!isNaN(parsedDate.getTime())) {
          setSelectedDate(parsedDate);
        }
      }
    }
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title="Edit Profile" onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Picture */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangeAvatar} disabled={uploadingAvatar}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {formData.name?.charAt(0)?.toUpperCase() || 'A'}
                  </Text>
                </View>
              )}

              <View style={styles.cameraIconContainer}>
                <Icon name="camera" size={16} color={COLORS.white} />
              </View>

              {uploadingAvatar && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Icon name="user" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
              <Icon name="phone" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => updateFormData('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Icon name="mail" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    formData.gender === option && styles.genderOptionActive,
                  ]}
                  onPress={() => updateFormData('gender', option)}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      formData.gender === option && styles.genderOptionTextActive,
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={openDatePicker}
            >
              <Icon name="calendar" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <Text style={[styles.input, !formData.dateOfBirth && styles.placeholderText]}>
                {formData.dateOfBirth || 'DD/MM/YYYY'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* State */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>State</Text>
            <View style={styles.inputContainer}>
              <Icon name="map-pin" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
                placeholder="Enter your state"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>

          {/* City */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputContainer}>
              <Icon name="map" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(text) => updateFormData('city', text)}
                placeholder="Enter your city"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Select Date of Birth</Text>
                  <TouchableOpacity
                    onPress={() => {
                      handleDateChange(null, selectedDate);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[styles.modalButton, styles.modalButtonPrimary]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                  textColor={COLORS.textPrimary}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1950, 0, 1)}
          />
        )
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: '#F8F9FA',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.sm,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '600',
    color: COLORS.white,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  formSection: {
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genderOption: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  genderOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  genderOptionTextActive: {
    color: COLORS.white,
  },
  buttonContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    height: 56,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 56,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalButton: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  modalButtonPrimary: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default EditProfileScreen;

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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import CustomIcon from '../../components/CustomIcon';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { showMessage } from 'react-native-flash-message';
import { useAppSelector } from '../../hooks/useRedux';
import { fetchProfile } from '../../store/slices/userSlice';
import { AppDispatch } from '../../store';

const BecomeCreatorScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const userProfile = useAppSelector((state) => state.user.profile);
  const profileLoading = useAppSelector((state) => state.user.loading);
  const [formData, setFormData] = useState({
    expertise: [] as string[],
    bio: '',
    bankAccount: '',
    ifscCode: '',
    panNumber: '',
  });

  const expertiseOptions = [
    'UPSC', 'SSC', 'Banking', 'Railways', 'Teaching',
    'Engineering', 'Medical', 'Law', 'Commerce', 'Other'
  ];

  useEffect(() => {
    // Fetch profile if not loaded
    if (!userProfile) {
      dispatch(fetchProfile());
    }
  }, []);

  // Handle nested response structure: response.data.user
  const userData = (userProfile as any)?.data?.user || userProfile;
  
  // Check if user is creator from profile data
  const isCreator = userData?.isCreator || false;
  const creatorProfile = userData?.creatorProfile;

  const toggleExpertise = (item: string) => {
    if (formData.expertise.includes(item)) {
      setFormData({
        ...formData,
        expertise: formData.expertise.filter(e => e !== item)
      });
    } else {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, item]
      });
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (formData.expertise.length === 0) {
      Alert.alert('Error', 'Please select at least one area of expertise');
      return;
    }
    if (!formData.bio.trim()) {
      Alert.alert('Error', 'Please enter a bio');
      return;
    }
    if (!formData.bankAccount.trim() || !formData.ifscCode.trim()) {
      Alert.alert('Error', 'Please enter bank details');
      return;
    }
    if (!formData.panNumber.trim()) {
      Alert.alert('Error', 'Please enter PAN number');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post(ENDPOINTS.BECOME_CREATOR, {
        expertise: formData.expertise,
        bio: formData.bio,
        bankDetails: {
          accountNumber: formData.bankAccount,
          ifscCode: formData.ifscCode,
        },
        panCard: formData.panNumber,
      });

      if (response.data.success) {
        showMessage({
          message: 'Success!',
          description: 'Creator application submitted successfully',
          type: 'success',
          duration: 3000,
        });
        // Refresh profile to get updated creator status
        dispatch(fetchProfile());
        navigation.goBack();
      }
    } catch (error: any) {
      console.error('Creator registration failed:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit application. Please try again.'
      );
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
        <Text style={styles.headerTitle}>
          {isCreator ? 'Creator Profile' : 'Become a Creator'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {profileLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : isCreator && creatorProfile ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Creator Status Card */}
          <View style={styles.creatorStatusCard}>
            <View style={styles.statusIconContainer}>
              <CustomIcon name="check-decagram" size={48} color="#10B981" type="material-community" />
            </View>
            <Text style={styles.statusTitle}>You're a Creator!</Text>
            <Text style={styles.statusSubtitle}>
              Share your knowledge and earn
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <CustomIcon name="currency-inr" size={20} color="#6366F1" type="material-community" />
              <Text style={styles.statValue}>₹{creatorProfile.totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <CustomIcon name="package-variant-closed" size={20} color="#10B981" type="material-community" />
              <Text style={styles.statValue}>{creatorProfile.totalContentSold}</Text>
              <Text style={styles.statLabel}>Sales</Text>
            </View>
            <View style={styles.statCard}>
              <CustomIcon name="star" size={20} color="#F59E0B" type="material-community" />
              <Text style={styles.statValue}>{creatorProfile.rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>

          {/* Profile Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.detailCard}>
              <Text style={styles.bioText}>{creatorProfile.bio}</Text>
            </View>
          </View>

          {/* Expertise */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expertise</Text>
            <View style={styles.chipsContainer}>
              {creatorProfile.expertise.map((item: string, index: number) => (
                <View key={index} style={styles.expertiseChip}>
                  <Text style={styles.expertiseChipText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Status Badge */}
          {creatorProfile.isVerified && (
            <View style={styles.verifiedBadge}>
              <CustomIcon name="check-decagram" size={18} color="#10B981" type="material-community" />
              <Text style={styles.verifiedText}>Verified Creator</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CreatorDashboard' as never)}
            >
              <CustomIcon name="view-dashboard" size={18} color="#FFFFFF" type="material-community" />
              <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('UploadContent' as never)}
            >
              <CustomIcon name="cloud-upload" size={18} color="#6366F1" type="material-community" />
              <Text style={styles.secondaryButtonText}>Upload Content</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <CustomIcon name="star-circle" size={48} color="#6366F1" type="material-community" />
          <Text style={styles.infoTitle}>Join Our Creator Community</Text>
          <Text style={styles.infoText}>
            Share your knowledge, help students succeed, and earn money by creating quality content
          </Text>
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <CustomIcon name="check-circle" size={20} color="#10B981" type="material-community" />
              <Text style={styles.benefitText}>Earn 70% revenue share</Text>
            </View>
            <View style={styles.benefitItem}>
              <CustomIcon name="check-circle" size={20} color="#10B981" type="material-community" />
              <Text style={styles.benefitText}>Reach thousands of students</Text>
            </View>
            <View style={styles.benefitItem}>
              <CustomIcon name="check-circle" size={20} color="#10B981" type="material-community" />
              <Text style={styles.benefitText}>Easy payout system</Text>
            </View>
          </View>
        </View>

        {/* Expertise Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Area of Expertise *</Text>
          <View style={styles.chipsContainer}>
            {expertiseOptions.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.chip,
                  formData.expertise.includes(item) && styles.chipSelected
                ]}
                onPress={() => toggleExpertise(item)}
              >
                <Text style={[
                  styles.chipText,
                  formData.expertise.includes(item) && styles.chipTextSelected
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about yourself and your experience..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={formData.bio}
            onChangeText={(text) => setFormData({ ...formData, bio: text })}
          />
        </View>

        {/* Bank Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bank Details *</Text>
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            placeholderTextColor="#9CA3AF"
            value={formData.bankAccount}
            onChangeText={(text) => setFormData({ ...formData, bankAccount: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            placeholderTextColor="#9CA3AF"
            value={formData.ifscCode}
            onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
            autoCapitalize="characters"
          />
        </View>

        {/* PAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAN Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="ABCDE1234F"
            placeholderTextColor="#9CA3AF"
            value={formData.panNumber}
            onChangeText={(text) => setFormData({ ...formData, panNumber: text.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Application</Text>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <CustomIcon name="information-outline" size={20} color="#6B7280" type="material-community" />
          <Text style={styles.disclaimerText}>
            Your application will be reviewed within 24-48 hours. We'll notify you via email once approved.
          </Text>
        </View>
      </ScrollView>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  // Creator Profile Styles
  creatorStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIconContainer: {
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bioText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  expertiseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  expertiseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  actionButtons: {
    gap: 10,
    marginBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    padding: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#6366F1',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
  },
  // Existing Form Styles
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  benefitsContainer: {
    alignSelf: 'stretch',
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
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
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  chipTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
});

export default BecomeCreatorScreen;

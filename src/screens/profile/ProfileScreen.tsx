import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  Linking,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../store';
import { logout, setUser } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { imagePickerUtils } from '../../utils/imagePicker.utils';
import { uploadService } from '../../api/services/upload.service';
import { userService } from '../../api/services';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  badge?: string | number;
}

interface ProfileSection {
  title: string;
  data: MenuItem[];
}

const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshUserData = async () => {
        try {
          const response = await userService.getProfile();
          console.log('👤 [ProfileScreen] User data received:', JSON.stringify(response, null, 2));
          
          // Handle nested response structure
          const userData = response?.data?.user || response?.user || response;
          console.log('👥 [ProfileScreen] Followers:', userData?.followers);
          console.log('👥 [ProfileScreen] Following:', userData?.following);
          
          if (userData) {
            dispatch(setUser(userData));
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      };
      
      refreshUserData();
    }, [dispatch])
  );

  const handleLogout = () => {
    // Use setTimeout to ensure Alert is shown after current event loop
    setTimeout(() => {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Logout', 
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(logout()).unwrap();
              } catch (error) {
                console.error('Logout error:', error);
              }
            }
          },
        ],
        { cancelable: true }
      );
    }, 100);
  };

  const handleChangeAvatar = async () => {
    try {
      const image = await imagePickerUtils.showImagePickerOptions();
      
      if (image) {
        setUploadingAvatar(true);
        
        try {
          // Upload to Cloudinary
          const response = await uploadService.uploadProfilePicture(image);
          
          if (response.success && response.data) {
            // Update user profile with new avatar URL
            await userService.updateProfile({ avatar: response.data.url });
            Alert.alert('Success', 'Profile picture updated successfully!');
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

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleShareApp = async () => {
    // Implementation for sharing app
    Alert.alert('Share App', 'Share app functionality coming soon!');
  };

  const handleRateApp = async () => {
    const storeUrl = Platform.OS === 'ios' 
      ? 'https://apps.apple.com/app/id123456789' 
      : 'https://play.google.com/store/apps/details?id=com.aspiranthub';
    
    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      Alert.alert('Error', 'Unable to open app store');
    }
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:support@aspiranthub.com');
  };

  const handleFollowersPress = () => {
    if (user?._id) {
      navigation.navigate('FollowersList', { userId: user._id, tab: 'followers' });
    }
  };

  const handleFollowingPress = () => {
    if (user?._id) {
      navigation.navigate('FollowersList', { userId: user._id, tab: 'following' });
    }
  };

  const handlePostsPress = () => {
    navigation.navigate('MyPosts');
  };

  const stats = [
    { icon: 'people', label: 'Followers', value: user?.followers || 0, color: '#2196F3', onPress: handleFollowersPress },
    { icon: 'person-add', label: 'Following', value: user?.following || 0, color: '#FF9800', onPress: handleFollowingPress },
    { icon: 'trophy', label: 'Points', value: user?.coins || 0, color: '#FFD700' },
    { icon: 'document-text', label: 'Posts', value: user?.totalPosts || 0, color: '#9C27B0', onPress: handlePostsPress },
  ];

  const profileSections: ProfileSection[] = [
    {
      title: 'Account',
      data: [
        { 
          id: 'edit_profile',
          label: 'Edit Profile', 
          icon: 'person-circle-outline', 
          onPress: handleEditProfile,
          showArrow: true,
        },
        { 
          id: 'become_creator',
          label: 'Become a Creator', 
          icon: 'briefcase-outline', 
          onPress: () => navigation.navigate('BecomeCreator'),
          showArrow: true,
        },
        // { 
        //   id: 'target_exams',
        //   label: 'Target Exams', 
        //   icon: 'school-outline', 
        //   onPress: () => navigation.navigate('TargetExams'),
        //   showArrow: true,
        // },
        { 
          id: 'saved_content',
          label: 'Saved Content', 
          icon: 'bookmark-outline', 
          onPress: () => navigation.navigate('SavedContent'),
          showArrow: true,
        },
        // { 
        //   id: 'study_plan',
        //   label: 'Study Plan', 
        //   icon: 'calendar-outline', 
        //   onPress: () => navigation.navigate('StudyPlan'),
        //   showArrow: true,
        // },
      ],
    },
    {
      title: 'Progress & Analytics',
      data: [
        { 
          id: 'test_history',
          label: 'Test History', 
          icon: 'list-outline', 
          onPress: () => navigation.navigate('TestHistory'),
          showArrow: true,
        },
        { 
          id: 'analytics',
          label: 'My Analytics', 
          icon: 'stats-chart-outline', 
          onPress: () => navigation.navigate('Analytics'),
          showArrow: true,
        },
        // { 
        //   id: 'performance',
        //   label: 'Performance Report', 
        //   icon: 'bar-chart-outline', 
        //   onPress: () => navigation.navigate('PerformanceReport'),
        //   showArrow: true,
        // },
        // { 
        //   id: 'achievements',
        //   label: 'Badges & Achievements', 
        //   icon: 'medal-outline', 
        //   onPress: () => navigation.navigate('Achievements'),
        //   badge: user?.unlockedBadges,
        //   showArrow: true,
        // },
        { 
          id: 'leaderboard',
          label: 'Leaderboard', 
          icon: 'podium-outline', 
          onPress: () => navigation.navigate('Leaderboard'),
          showArrow: true,
        },
      ],
    },
    {
      title: 'Wallet & Rewards',
      data: [
        { 
          id: 'wallet',
          label: 'My Wallet', 
          icon: 'wallet-outline', 
          onPress: () => navigation.navigate('Wallet'),
          badge: `${user?.coins || 0} coins`,
          showArrow: true,
        },
        // { 
        //   id: 'coins',
        //   label: 'Earn Coins', 
        //   icon: 'gift-outline', 
        //   onPress: () => navigation.navigate('EarnCoins'),
        //   showArrow: true,
        // },
        { 
          id: 'referral',
          label: 'Refer & Earn', 
          icon: 'share-social-outline', 
          onPress: () => navigation.navigate('Referral'),
          showArrow: true,
        },
        { 
          id: 'transactions',
          label: 'Transaction History', 
          icon: 'receipt-outline', 
          onPress: () => navigation.navigate('TransactionHistory'),
          showArrow: true,
        },
      ],
    },
    // {
    //   title: 'Preferences',
    //   data: [
    //     { 
    //       id: 'notifications',
    //       label: 'Push Notifications', 
    //       icon: 'notifications-outline', 
    //       onPress: () => setNotificationsEnabled(!notificationsEnabled),
    //       showSwitch: true,
    //       switchValue: notificationsEnabled,
    //     },
    //     { 
    //       id: 'dark_mode',
    //       label: 'Dark Mode', 
    //       icon: 'moon-outline', 
    //       onPress: () => setDarkModeEnabled(!darkModeEnabled),
    //       showSwitch: true,
    //       switchValue: darkModeEnabled,
    //     },
    //     { 
    //       id: 'language',
    //       label: 'Language', 
    //       icon: 'language-outline', 
    //       onPress: () => navigation.navigate('Language'),
    //       badge: 'English',
    //       showArrow: true,
    //     },
    //     { 
    //       id: 'download',
    //       label: 'Download Settings', 
    //       icon: 'cloud-download-outline', 
    //       onPress: () => navigation.navigate('DownloadSettings'),
    //       showArrow: true,
    //     },
    //   ],
    // },
    {
      title: 'More',
      data: [
        { 
          id: 'rate',
          label: 'Rate Us', 
          icon: 'star-outline', 
          onPress: handleRateApp,
          showArrow: true,
        },
        { 
          id: 'share',
          label: 'Share App', 
          icon: 'share-outline', 
          onPress: handleShareApp,
          showArrow: true,
        },
        { 
          id: 'help',
          label: 'Help & FAQ', 
          icon: 'help-circle-outline', 
          onPress: () => navigation.navigate('Help'),
          showArrow: true,
        },
        { 
          id: 'contact',
          label: 'Contact Support', 
          icon: 'chatbox-ellipses-outline', 
          onPress: handleContactUs,
          showArrow: true,
        },
        { 
          id: 'privacy',
          label: 'Privacy Policy', 
          icon: 'shield-checkmark-outline', 
          onPress: () => navigation.navigate('PrivacyPolicy'),
          showArrow: true,
        },
        { 
          id: 'terms',
          label: 'Terms & Conditions', 
          icon: 'document-text-outline', 
          onPress: () => navigation.navigate('Terms'),
          showArrow: true,
        },
        { 
          id: 'about',
          label: 'About Us', 
          icon: 'information-circle-outline', 
          onPress: () => navigation.navigate('About'),
          showArrow: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gradient Background */}
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            {/* Profile Picture */}
            <TouchableOpacity 
              onPress={handleChangeAvatar} 
              disabled={uploadingAvatar}
              style={styles.avatarContainer}
            >
              <View style={styles.avatarWrapper}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </Text>
                  </View>
                )}
                {uploadingAvatar && (
                  <View style={styles.avatarLoading}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                  </View>
                )}
              </View>
              <View style={styles.cameraIconContainer}>
                <Icon name="camera" size={14} color={COLORS.white} />
              </View>
            </TouchableOpacity>
            
            {/* User Info */}
            <Text style={styles.userName}>{user?.name || 'Aspirant'}</Text>
            <Text style={styles.userEmail}>{user?.email || user?.phone || '+91 XXXXXXXXXX'}</Text>
            
            {/* Premium Badge (if applicable) */}
            {user?.isPremium && (
              <View style={styles.premiumBadge}>
                <Icon name="star" size={14} color="#FFD700" />
                <Text style={styles.premiumText}>Premium Member</Text>
              </View>
            )}

            {/* Minimal Stats Row */}
            <View style={styles.statsRow}>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={handleFollowersPress}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{user?.followers || 0}</Text>
                <Text style={styles.statText}>Followers</Text>
              </TouchableOpacity>
              
              <View style={styles.statDivider} />
              
              <TouchableOpacity 
                style={styles.statItem}
                onPress={handleFollowingPress}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{user?.following || 0}</Text>
                <Text style={styles.statText}>Following</Text>
              </TouchableOpacity>
              
              <View style={styles.statDivider} />
              
              <TouchableOpacity 
                style={styles.statItem}
                onPress={handlePostsPress}
                activeOpacity={0.7}
              >
                <Text style={styles.statNumber}>{user?.totalPosts || 0}</Text>
                <Text style={styles.statText}>Posts</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.data.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex === section.data.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconWrapper}>
                      <Icon name={item.icon} size={22} color={COLORS.primary} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                  </View>
                  
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    {item.showSwitch && (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onPress}
                        trackColor={{ false: '#D1D5DB', true: COLORS.primary + '80' }}
                        thumbColor={item.switchValue ? COLORS.primary : '#f4f3f4'}
                      />
                    )}
                    {item.showArrow && (
                      <Icon name="chevron-forward" size={20} color="#9CA3AF" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemLast]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconWrapper}>
                  <Icon name="log-out-outline" size={20} color={COLORS.error} />
                </View>
                <Text style={[styles.menuItemText, { color: COLORS.error }]}>Logout</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerGradient: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white + '30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.white,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.white + 'DD',
    marginBottom: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2,
  },
  statText: {
    fontSize: 11,
    color: COLORS.white + 'CC',
    fontWeight: '400',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
    paddingLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '08',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: COLORS.primary + '12',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 16,
  },
});

export default ProfileScreen;

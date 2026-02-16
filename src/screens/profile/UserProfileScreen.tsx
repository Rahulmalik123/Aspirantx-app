import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateFollowingCount } from '../../store/slices/authSlice';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { userService } from '../../api/services';
import { socialService } from '../../api/services/social.service';
import { User } from '../../types/social.types';
import PostCard from '../../components/feed/PostCard';
import Header from '../../components/common/Header';

const { width } = Dimensions.get('window');

interface UserProfileRouteParams {
  userId: string;
}

const UserProfileScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const dispatch = useDispatch();
  const { userId } = route.params as UserProfileRouteParams;
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?._id === userId || currentUser?._id?.toString() === userId?.toString();

  console.log('🔍 [UserProfile] Debug:', {
    currentUserId: currentUser?._id,
    routeUserId: userId,
    isOwnProfile,
    comparison1: currentUser?._id === userId,
    comparison2: currentUser?._id?.toString() === userId?.toString(),
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getUserById(userId);
      if (response.success && response.data) {
        setProfileUser(response.data);
        // Check if current user is following this user
        setIsFollowing(response.data.followersList?.includes(currentUser?._id) || false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await socialService.getUserPosts(userId);
      if (response.success && response.data) {
        setUserPosts(response.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserProfile(), fetchUserPosts()]);
    setRefreshing(false);
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        const response = await socialService.unfollowUser(userId);
        if (response.success) {
          setIsFollowing(false);
          // Update follower count on profile user
          if (profileUser) {
            setProfileUser({
              ...profileUser,
              followers: (profileUser.followers || 1) - 1,
            });
          }
          // Update following count on current user in Redux
          dispatch(updateFollowingCount('decrement'));
        }
      } else {
        const response = await socialService.followUser(userId);
        if (response.success) {
          setIsFollowing(true);
          // Update follower count on profile user
          if (profileUser) {
            setProfileUser({
              ...profileUser,
              followers: (profileUser.followers || 0) + 1,
            });
          }
          // Update following count on current user in Redux
          dispatch(updateFollowingCount('increment'));
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await socialService.likePost(postId);
      // Update local state
      setUserPosts(posts =>
        posts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likedBy?.includes(currentUser?._id);
            return {
              ...post,
              likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1,
              likedBy: isLiked
                ? post.likedBy.filter((id: string) => id !== currentUser?._id)
                : [...(post.likedBy || []), currentUser?._id],
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post details/comments screen
    console.log('Comment on post:', postId);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="person-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={profileUser.name}
        subtitle={profileUser.username ? `@${profileUser.username}` : undefined}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Avatar and Basic Info */}
          <View style={styles.profileTopSection}>
            <View style={styles.avatarContainer}>
              {profileUser.avatar || profileUser.profilePicture ? (
                <Image
                  source={{ uri: profileUser.avatar || profileUser.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {profileUser.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Stats - Horizontal on same line as avatar */}
            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statBox} activeOpacity={0.7}>
                <Text style={styles.statNumber}>{userPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} activeOpacity={0.7}>
                <Text style={styles.statNumber}>{profileUser.followers || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statBox} activeOpacity={0.7}>
                <Text style={styles.statNumber}>{profileUser.following || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Name and Bio */}
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{profileUser.name}</Text>
            {profileUser.bio && (
              <Text style={styles.bio}>{profileUser.bio}</Text>
            )}
            {profileUser.email && !isOwnProfile && (
              <View style={styles.metaInfo}>
                <Icon name="mail-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{profileUser.email}</Text>
              </View>
            )}
          </View>

          {/* About Section - Preparing For */}
          {profileUser.targetExams && profileUser.targetExams.length > 0 && (
            <View style={styles.aboutSection}>
              <View style={styles.aboutHeader}>
                <Icon name="book-outline" size={18} color={COLORS.primary} />
                <Text style={styles.aboutTitle}>Preparing For</Text>
              </View>
              <View style={styles.examsList}>
                {profileUser.targetExams.map((exam, index) => (
                  <View key={exam._id || index} style={styles.examChip}>
                    <Icon name="school-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.examChipText}>{exam.name}</Text>
                    {exam.categoryName && (
                      <Text style={styles.examCategoryText}>• {exam.categoryName}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          {!isOwnProfile && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.primaryActionButton, isFollowing && styles.followingButton]}
                onPress={handleFollowToggle}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* User Posts */}
        <View style={styles.postsSection}>
          {userPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="image-multiple-outline" size={64} color={COLORS.gray300} />
              </View>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>
                {isOwnProfile 
                  ? 'Share your first post with the community' 
                  : 'This user hasn\'t posted anything yet'}
              </Text>
            </View>
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onUserPress={(userId) => {
                  if (userId !== currentUser?._id) {
                    navigation.push('UserProfile', { userId });
                  }
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    fontWeight: '500',
  },
  backButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  
  // Profile Header
  profileHeader: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  profileTopSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    marginRight: SPACING.lg,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray200,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.5,
  },

  // Stats
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    minWidth: 70,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // Profile Info
  profileInfo: {
    marginBottom: SPACING.lg,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    letterSpacing: -0.2,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },

  // About Section
  aboutSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.xs,
    letterSpacing: -0.2,
  },
  examsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: 4,
  },
  examChipText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  examCategoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginLeft: 2,
  },

  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  followingButton: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  followingButtonText: {
    color: COLORS.textPrimary,
  },

  // Posts Section
  postsSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },

  // Empty States
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconContainer: {
    marginBottom: SPACING.lg,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default UserProfileScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { PostCard, CreatePostModal, CommentModal, EditPostModal } from '../../components/feed';
import { socialService } from '../../api/services/social.service';
import { Post, CreatePostRequest } from '../../types/social.types';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const FeedScreen = () => {
  const navigation = useNavigation<any>();
  const currentUser = useSelector((state: any) => state.auth.user);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Fetch feed posts
  const fetchFeed = useCallback(async (page: number = 1, isRefresh = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await socialService.getFeed(page, 10);
      
      if (response.success && response.data) {
        const feedData = response.data.data || response.data;
        const paginationData = response.data.pagination;
        
        if (isRefresh || page === 1) {
          setPosts(Array.isArray(feedData) ? feedData : []);
        } else {
          setPosts(prev => [...prev, ...(Array.isArray(feedData) ? feedData : [])]);
        }
        
        setHasMore(paginationData?.hasNextPage || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
      Alert.alert('Error', 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFeed(currentPage + 1);
    }
  };

  const handleCreatePost = async (postData: CreatePostRequest) => {
    try {
      console.log('handleCreatePost called with:', postData);
      const response = await socialService.createPost(postData);
      
      console.log('Create post response:', response);
      if (response.success && response.data) {
        // Add new post to the top of the feed
        setPosts(prev => [response.data, ...prev]);
        Alert.alert('Success', 'Post created successfully!');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(prev =>
        prev.map(post => {
          if (post._id === postId) {
            const isLiked = post.likedBy?.includes(currentUser?._id);
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              likedBy: isLiked
                ? post.likedBy.filter(id => id !== currentUser?._id)
                : [...(post.likedBy || []), currentUser?._id],
            };
          }
          return post;
        })
      );

      await socialService.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update
      fetchFeed(1, true);
    }
  };

  const handleCommentPress = (postId: string) => {
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  };

  const handleCommentModalClose = () => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
  };

  const handleCommentAdded = () => {
    // Refresh feed to update comment counts
    fetchFeed(currentPage, true);
  };

  const handleSharePost = (postId: string) => {
    Alert.alert('Share', 'Share functionality will be implemented');
  };

  const handleVoteOnPoll = async (postId: string, optionIndex: number) => {
    try {
      // Optimistically update UI
      setPosts(prev =>
        prev.map(post => {
          if (post._id === postId && post.poll) {
            const updatedOptions = post.poll.options.map((option, idx) => {
              if (idx === optionIndex) {
                return {
                  ...option,
                  votes: option.votes + 1,
                  votedBy: [...(option.votedBy || []), currentUser?._id],
                };
              }
              return option;
            });
            
            return {
              ...post,
              poll: {
                ...post.poll,
                options: updatedOptions,
              },
            };
          }
          return post;
        })
      );

      await socialService.voteOnPoll(postId, optionIndex);
    } catch (error) {
      console.error('Error voting on poll:', error);
      Alert.alert('Error', 'Failed to submit vote. Please try again.');
      // Revert optimistic update
      fetchFeed(currentPage, true);
    }
  };

  const handleUserPress = (userId: string) => {
    console.log('🔍 [FeedScreen] handleUserPress:', { userId, currentUserId: currentUser?._id });
    // Navigate to user profile
    if (userId === currentUser?._id) {
      // Navigate to own profile tab (ProfileTab is the screen name in MainTabNavigator)
      navigation.navigate('ProfileTab');
    } else {
      // Navigate to other user's profile
      navigation.navigate('UserProfile', { userId });
    }
  };

  const handleEditPost = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (post) {
      setEditingPost(post);
      setEditModalVisible(true);
    }
  };

  const handleUpdatePost = async (postId: string, postData: { content: string; hashtags?: string[]; images?: string[] }) => {
    try {
      const response = await socialService.updatePost(postId, postData);
      if (response.success && response.data) {
        // Update post in local state
        setPosts(prev =>
          prev.map(post =>
            post._id === postId ? { ...post, ...response.data } : post
          )
        );
        Alert.alert('Success', 'Post updated successfully!');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await socialService.deletePost(postId);
              if (response.success) {
                // Remove post from local state
                setPosts(prev => prev.filter(post => post._id !== postId));
                Alert.alert('Success', 'Post deleted successfully!');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLikePost}
      onComment={handleCommentPress}
      onShare={handleSharePost}
      onUserPress={handleUserPress}
      onEdit={handleEditPost}
      onDelete={handleDeletePost}
      onVote={handleVoteOnPoll}
    />
  );

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="newspaper-outline" size={64} color="#CCC" />
        <Text style={styles.emptyTitle}>No Posts Yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the first to share something with the community!
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>Create Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} >
      {/* Royal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Icon name="flame" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Feed</Text>
            <Text style={styles.headerSubtitle}>Stay Connected</Text>
          </View>
        </View>
        {/* <TouchableOpacity
          style={styles.createPostButton}
          onPress={() => setCreateModalVisible(true)}
        >
          <Icon name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity> */}
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        contentContainerStyle={posts.length === 0? styles.emptyList:{
          paddingBottom: 80,
          paddingTop:15
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createModalVisible}
        onClose={() => {
          console.log('Modal closing');
          setCreateModalVisible(false);
        }}
        onSubmit={handleCreatePost}
        userName="User Name" // Replace with actual user data
        userAvatar="https://via.placeholder.com/40" // Replace with actual user avatar
      />

      {/* Comment Modal */}
      {selectedPostId && (
        <CommentModal
          visible={commentModalVisible}
          postId={selectedPostId}
          onClose={handleCommentModalClose}
          onCommentAdded={handleCommentAdded}
        />
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        visible={editModalVisible}
        post={editingPost}
        onClose={() => {
          setEditModalVisible(false);
          setEditingPost(null);
        }}
        onSubmit={handleUpdatePost}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          console.log('FAB clicked, opening modal');
          setCreateModalVisible(true);
        }}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
    borderBottomColor: 'rgba(99, 102, 241, 0.08)',
    shadowColor: 'COLORS.primary',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A2E',
    letterSpacing: 0,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
    letterSpacing: 0,
    marginTop: 1,
  },
  createPostButton: {
    padding: 4,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default FeedScreen;

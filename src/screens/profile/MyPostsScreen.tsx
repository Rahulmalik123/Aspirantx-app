import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { socialService } from '../../api/services';
import Header from '../../components/common/Header';
import { PostCard, EditPostModal } from '../../components/feed';
import { Post as PostType } from '../../types/social.types';

const MyPostsScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchPosts();
    }
  }, [user?._id]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await socialService.getUserPosts(user!._id);
      if (response.success) {
        setPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLikePost = async (postId: string) => {
    try {
      // Optimistically update UI
      setPosts(prev =>
        prev.map(post => {
          if (post._id === postId) {
            const isLiked = post.likedBy?.includes(user?._id);
            return {
              ...post,
              likes: isLiked ? post.likes - 1 : post.likes + 1,
              likedBy: isLiked
                ? post.likedBy.filter(id => id !== user?._id)
                : [...(post.likedBy || []), user?._id],
            };
          }
          return post;
        })
      );

      await socialService.likePost(postId);
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert on error
      fetchPosts();
    }
  };

  const handleCommentPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
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
                  votedBy: [...(option.votedBy || []), user?._id],
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
      fetchPosts();
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

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return postDate.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderPost = ({ item }: { item: PostType }) => (
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

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="document-text-outline" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Share your thoughts with the community!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('FeedTab')}
      >
        <Icon name="add-circle-outline" size={20} color="#FFF" />
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="My Posts" onBackPress={() => navigation.goBack()} />

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          visible={editModalVisible}
          post={editingPost}
          onClose={() => {
            setEditModalVisible(false);
            setEditingPost(null);
          }}
          onSubmit={handleUpdatePost}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 3,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 24,
    gap: SPACING.xs,
    marginTop: SPACING.md,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default MyPostsScreen;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { PostCard, CommentModal } from '../../components/feed';
import { RootState } from '../../store';
import { socialService } from '../../api/services/social.service';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const PostDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { postId } = route.params;

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);

  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const result = await socialService.getPost(postId);
      setPost(result.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load post');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (postId: string) => {
    // Like functionality
    console.log('Like post:', postId);
  };

  const handleComment = (postId: string) => {
    setCommentModalVisible(true);
  };

  const handleShare = (postId: string) => {
    // Share functionality
    console.log('Share post:', postId);
  };

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color="#D1D5DB" />
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <PostCard
          post={post}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onUserPress={handleUserPress}
        />

     
      </ScrollView>

      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        postId={postId}
        onClose={() => setCommentModalVisible(false)}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingTop:20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  commentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  commentsButtonText: {
    marginLeft: 8,
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PostDetailScreen;

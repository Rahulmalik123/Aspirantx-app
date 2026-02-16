import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Comment, Post } from '../../types/social.types';
import { socialService } from '../../api/services/social.service';
import { COLORS } from '../../constants/colors';

type RootStackParamList = {
  Comments: { postId: string; post?: Post };
};

type CommentsScreenRouteProp = RouteProp<RootStackParamList, 'Comments'>;
type CommentsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Comments'>;

interface Props {
  route: CommentsScreenRouteProp;
  navigation: CommentsScreenNavigationProp;
}

const CommentsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId, post } = route.params;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: 'Comments',
      headerStyle: {
        backgroundColor: COLORS.primary,
      },
      headerTintColor: '#fff',
    });
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await socialService.getComments(postId);
      
      if (response.success && response.data) {
        const commentsData = response.data.data || response.data;
        setComments(Array.isArray(commentsData) ? commentsData : []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const response = await socialService.addComment(postId, {
        content: commentText.trim(),
        parentId: replyingTo?.id,
      });

      if (response.success && response.data) {
        // Fetch comments again to get updated list with proper nesting
        await fetchComments();
        setCommentText('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialService.deleteComment(postId, commentId);
              setComments(prev => prev.filter(c => c._id !== commentId));
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
  };

  const getUserInfo = (userObj: any) => {
    if (typeof userObj === 'object' && userObj) {
      return {
        name: userObj.name || 'Unknown User',
        profilePicture: userObj.profilePicture || 'https://via.placeholder.com/40',
      };
    }
    return {
      name: 'Unknown User',
      profilePicture: 'https://via.placeholder.com/40',
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const userInfo = getUserInfo(item.userId);
    const isOwnComment = false; // Replace with actual user ID check

    return (
      <View style={styles.commentContainer}>
        <TouchableOpacity>
          <Image
            source={{ uri: userInfo.profilePicture }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>{userInfo.name}</Text>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>

          <Text style={styles.commentText}>{item.content}</Text>

          <View style={styles.commentActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReply(item._id, userInfo.name)}
            >
              <Text style={styles.actionText}>Reply</Text>
            </TouchableOpacity>

            {isOwnComment && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteComment(item._id)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map((reply: any) => {
                const replyUserInfo = getUserInfo(reply.userId);
                return (
                  <View key={reply._id} style={styles.replyItem}>
                    <Image
                      source={{ uri: replyUserInfo.profilePicture }}
                      style={styles.replyAvatar}
                    />
                    <View style={styles.replyContent}>
                      <Text style={styles.replyUsername}>{replyUserInfo.name}</Text>
                      <Text style={styles.replyText}>{reply.content}</Text>
                      <Text style={styles.replyTimestamp}>{formatTime(reply.createdAt)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {post && (
        <View style={styles.postPreview}>
          <Text style={styles.postAuthor}>
            {getUserInfo(post.userId).name}
          </Text>
          <Text style={styles.postContent} numberOfLines={2}>
            {post.content}
          </Text>
        </View>
      )}

      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to @{replyingTo.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Icon name="close-circle" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#999"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!commentText.trim() || submitting) && styles.sendButtonDisabled,
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postPreview: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  postContent: {
    fontSize: 13,
    color: '#666',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  deleteText: {
    color: '#f44336',
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#eee',
    paddingLeft: 12,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  replyAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  replyText: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  replyTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
  },
  replyingToText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default CommentsScreen;

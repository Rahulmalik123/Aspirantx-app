import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Comment } from '../../types/social.types';
import { socialService } from '../../api/services/social.service';
import { COLORS } from '../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CommentModalProps {
  visible: boolean;
  postId: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  postId,
  onClose,
  onCommentAdded,
}) => {
  const currentUser = useSelector((state: any) => state.auth.user);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      fetchComments();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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
        await fetchComments();
        setCommentText('');
        setReplyingTo(null);
        onCommentAdded?.();
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
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await socialService.deleteComment(postId, commentId);
              setComments(prev => prev.filter(c => c._id !== commentId));
              onCommentAdded?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  const handleReply = (commentId: string, name: string) => {
    setReplyingTo({ id: commentId, name });
  };

  const getUserInfo = (comment: any) => {
    // Backend sends 'user' field, not 'userId'
    const userObj = comment.user || comment.userId;
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

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const userInfo = getUserInfo(item);
    const userObj = (item as any).user || item.userId;
    const commentUserId = typeof userObj === 'object' ? userObj?._id : userObj;
    const isOwnComment = !!currentUser?._id && commentUserId === currentUser._id;

    return (
      <View style={styles.commentItem}>
        <Image
          source={{ uri: userInfo.profilePicture }}
          style={styles.avatar}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.username}>{userInfo.name}</Text>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
          
          <View style={styles.commentActions}>
            <TouchableOpacity onPress={() => handleReply(item._id, userInfo.name)}>
              <Text style={styles.replyButton}>Reply</Text>
            </TouchableOpacity>
            {isOwnComment && (
              <TouchableOpacity onPress={() => handleDeleteComment(item._id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>

          {item.replies && item.replies.length > 0 && (
            <View style={styles.repliesContainer}>
              {item.replies.map((reply: any) => {
                const replyUserInfo = getUserInfo(reply);
                return (
                  <View key={reply._id} style={styles.replyItem}>
                    <Image
                      source={{ uri: replyUserInfo.profilePicture }}
                      style={styles.replyAvatar}
                    />
                    <View style={styles.replyContent}>
                      <Text style={styles.replyUsername}>
                        {replyUserInfo.name}
                        <Text style={styles.replyText}> {reply.content}</Text>
                      </Text>
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <KeyboardAvoidingView
            style={styles.keyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.dragHandle} />
              <Text style={styles.title}>Comments</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : (
              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Icon name="chatbubbles-outline" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No comments yet</Text>
                    <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                  </View>
                }
              />
            )}

            {/* Input Section */}
            <View style={styles.inputContainer}>
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>
                    Replying to {replyingTo.name}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Icon name="close-circle" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.inputRow}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/32' }}
                  style={styles.inputAvatar}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                {commentText.trim() ? (
                  <TouchableOpacity
                    onPress={handleSubmitComment}
                    disabled={submitting}
                    style={styles.postButton}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.postButtonText}>Post</Text>
                    )}
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    height: SCREEN_HEIGHT * 0.85,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    lineHeight: 18,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyButton: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    marginRight: 16,
  },
  deleteButton: {
    fontSize: 13,
    color: '#f44336',
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 12,
  },
  replyItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontWeight: '400',
    color: '#333',
  },
  replyTimestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  replyingToText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
    paddingVertical: 0,
  },
  postButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default CommentModal;

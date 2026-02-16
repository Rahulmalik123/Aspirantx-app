import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { Post, User } from '../../types/social.types';
import { COLORS } from '../../constants/colors';
import SaveButton from '../SaveButton';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onVote?: (postId: string, optionIndex: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onEdit,
  onDelete,
  onVote,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const currentUser = useSelector((state: any) => state.auth.user);
  const user = typeof post.userId === 'object' ? post.userId : null;
  const isLiked = post.likedBy?.includes(currentUser?._id);
  const isOwnPost = user?._id === currentUser?._id;

  const MAX_TEXT_LENGTH = 80;
  const shouldTruncate = post.content.length > MAX_TEXT_LENGTH;

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

  const formatPollExpiry = (dateString: string) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    
    // If expired
    if (diffMs <= 0) {
      return 'Poll ended';
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d left`;
    }
    if (diffHours > 0) {
      return `${diffHours}h left`;
    }
    if (diffMinutes > 0) {
      return `${diffMinutes}m left`;
    }
    return `${diffSeconds}s left`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => user && onUserPress?.(user._id)}
      >
        {user?.avatar || user?.profilePicture ? (
          <Image
            source={{
              uri: user?.avatar || user?.profilePicture,
            }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Anonymous'}</Text>
          <Text style={styles.timeText}>{formatTime(post.createdAt)}</Text>
        </View>
        {isOwnPost && (
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => setShowMenu(true)}
          >
            <Icon name="ellipsis-horizontal" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.contentText}>
          {shouldTruncate && !showFullText
            ? `${post.content.substring(0, MAX_TEXT_LENGTH)}...`
            : post.content}
        </Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
            <Text style={styles.readMoreText}>
              {showFullText ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        )}
        
        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <View style={styles.hashtagContainer}>
            {post.hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(
                  e.nativeEvent.contentOffset.x / (width - 32)
                );
                setImageIndex(newIndex);
              }}
            >
              {post.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {post.images.length > 1 && (
              <View style={styles.imageIndicator}>
                {post.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicatorDot,
                      imageIndex === index && styles.indicatorDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Poll - Instagram Style */}
        {post.poll && post.poll.options && post.poll.options.length > 0 && (
          <View style={styles.pollContainer}>
            {post.poll.options?.map((option, index) => {
              const totalVotes = post.poll!.options.reduce((sum, opt) => sum + opt.votes, 0);
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              const hasVoted = option.votedBy?.includes(currentUser?._id);
              const userHasVoted = post.poll!.options.some(opt => opt.votedBy?.includes(currentUser?._id));
              const isWinning = userHasVoted && option.votes === Math.max(...post.poll!.options.map(o => o.votes));
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pollOption,
                    userHasVoted && styles.pollOptionAfterVote,
                  ]}
                  onPress={() => !userHasVoted && onVote?.(post._id, index)}
                  disabled={userHasVoted}
                  activeOpacity={userHasVoted ? 1 : 0.7}
                >
                  {/* Progress Bar Background */}
                  {userHasVoted && (
                    <View 
                      style={[
                        styles.pollProgressBar, 
                        { width: `${percentage}%` },
                        isWinning && styles.pollProgressBarWinning,
                      ]} 
                    />
                  )}
                  
                  {/* Option Content */}
                  <View style={styles.pollOptionRow}>
                    <Text style={[
                      styles.pollOptionText,
                      userHasVoted && styles.pollOptionTextBold,
                    ]}>
                      {option.text}
                    </Text>
                    
                    {userHasVoted && (
                      <View style={styles.pollPercentageContainer}>
                        <Text style={[
                          styles.pollPercentageText,
                          isWinning && styles.pollPercentageTextWinning,
                        ]}>
                          {percentage.toFixed(0)}%
                        </Text>
                        {hasVoted && (
                          <Icon 
                            name="checkmark-circle" 
                            size={16} 
                            color={COLORS.primary} 
                            style={styles.pollCheckIcon}
                          />
                        )}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            
            {/* Poll Footer */}
            <View style={styles.pollFooter}>
              <Icon name="bar-chart-outline" size={12} color={COLORS.gray500} />
              <Text style={styles.pollFooterText}>
                {post.poll.options.reduce((sum, opt) => sum + opt.votes, 0)} votes • {formatPollExpiry(post.poll.expiresAt)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Actions - Instagram style */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(post._id)}
          >
            <Icon 
              name={isLiked ? "heart" : "heart-outline"} 
              size={24} 
              color={isLiked ? "#FF3B30" : COLORS.gray800} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onComment(post._id)}
          >
            <Icon name="chatbubble-outline" size={22} color={COLORS.gray800} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare?.(post._id)}
          >
            <Icon name="paper-plane-outline" size={22} color={COLORS.gray800} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightActions}>
          <SaveButton 
            contentType="post"
            contentId={post._id}
            size={24}
            showFeedback={false}
          />
        </View>
      </View>

      {/* Stats - Instagram style */}
      <View style={styles.stats}>
        {post.likes > 0 && (
          <Text style={styles.likesText}>
            <Text style={styles.likesCount}>{formatCount(post.likes)}</Text> likes
          </Text>
        )}
        {post.comments > 0 && (
          <TouchableOpacity onPress={() => onComment(post._id)}>
            <Text style={styles.commentsText}>
              View all {formatCount(post.comments)} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Modal for own posts */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onEdit?.(post._id);
              }}
            >
              <Icon name="create-outline" size={24} color="#000" />
              <Text style={styles.menuItemText}>Edit Post</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onDelete?.(post._id);
              }}
            >
              <Icon name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>Delete Post</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Icon name="close-outline" size={24} color={COLORS.gray600} />
              <Text style={[styles.menuItemText, { color: COLORS.gray600 }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.gray200,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarPlaceholderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 1,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  content: {
    paddingHorizontal: 12,
    // paddingTop: 8,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.gray800,
    marginBottom: 4,
  },
  readMoreText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 4,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // marginBottom: 6,
    marginTop: 2,
  },
  hashtag: {
    fontSize: 14,
    color: COLORS.primary,
    marginRight: 10,
    marginBottom: 6,
    fontWeight: '600',
    // backgroundColor: 'rgba(99, 102, 241, 0.08)',
    // paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageContainer: {
    marginTop: 0,
    marginHorizontal: -12,
    position: 'relative',
  },
  postImage: {
    width: width - 24,
    height: 320,
    marginHorizontal: 0,
    borderRadius: 0,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 3,
  },
  indicatorDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
    height: 6,
    borderRadius: 3,
  },
  pollContainer: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  pollOption: {
    position: 'relative',
    height: 40,
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  pollOptionAfterVote: {
    backgroundColor: '#FFFFFF',
    borderColor: COLORS.gray300,
  },
  pollProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: `${COLORS.primary}12`,
    borderRadius: 10,
  },
  pollProgressBarWinning: {
    backgroundColor: `${COLORS.primary}18`,
  },
  pollOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 2,
  },
  pollOptionText: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
    flex: 1,
  },
  pollOptionTextBold: {
    fontWeight: '700',
  },
  pollPercentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pollPercentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray600,
  },
  pollPercentageTextWinning: {
    color: COLORS.primary,
    fontSize: 14,
  },
  pollCheckIcon: {
    marginLeft: 2,
  },
  pollFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
    gap: 4,
  },
  pollFooterText: {
    fontSize: 12,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    // paddingTop: 12,
    // paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.1)',
    marginTop: 0,
  },
  leftActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rightActions: {
    paddingVertical: 6,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  stats: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  likesText: {
    fontSize: 14,
    color: COLORS.gray800,
    fontWeight: '600',
    marginBottom: 2,
  },
  likesCount: {
    fontWeight: '800',
    color: COLORS.gray900,
  },
  commentsText: {
    fontSize: 14,
    color: COLORS.gray600,
    // marginTop: 2,
    fontWeight: '500',
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    marginRight: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionTextActive: {
    color: COLORS.primary,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.85,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.gray900,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
  },
});

export default PostCard;

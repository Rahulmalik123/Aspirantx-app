import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';
import {useSelector} from 'react-redux';
import CustomIcon from '../../components/CustomIcon';
import contentService, {ContentDetails} from '../../api/services/contentService';

const ContentDetailsScreen = ({route, navigation}: any) => {
  const {contentId} = route.params;
  const currentUser = useSelector((state: any) => state.auth.user);
  
  const [content, setContent] = useState<ContentDetails | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if current user is the creator
  const isOwnContent = content && currentUser && (
    content.createdBy?._id === currentUser._id || 
    content.createdBy === currentUser._id
  );

  useEffect(() => {
    loadContentDetails();
    trackView();
  }, [contentId]);

  const loadContentDetails = async () => {
    try {
      setLoading(true);
      const response = await contentService.getContentDetails(contentId);
      console.log('📝 [ContentDetails] Response:', response);
      
      // Handle nested response structure
      const responseData = (response as any).data || response;
      const contentData = responseData.content || response.content;
      const reviewsData = responseData.reviews || response.reviews || [];
      
      console.log('📝 [ContentDetails] Content:', contentData);
      console.log('🖼️ [ContentDetails] Thumbnail:', contentData?.thumbnail);
      console.log('🎨 [ContentDetails] Content Type:', contentData?.contentType);
      setContent(contentData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('❌ [ContentDetails] Failed to load:', error);
      Alert.alert('Error', 'Failed to load content details');
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await contentService.trackView(contentId);
    } catch (error) {
      console.log('View tracking failed:', error);
    }
  };

  const handlePurchase = async () => {
    if (!content) return;

    if (content.isPurchased) {
      Alert.alert('Already Purchased', 'You have already purchased this content. Check "My Purchases" to download.');
      return;
    }

    if (content.isFree) {
      // Free content - direct purchase
      try {
        setPurchasing(true);
        await contentService.purchaseContent(contentId);
        Alert.alert('Success', 'Content added to your library!', [
          {
            text: 'View Downloads',
            onPress: () => navigation.navigate('MyPurchases'),
          },
          {text: 'OK'},
        ]);
        // Reload content to update isPurchased status
        loadContentDetails();
      } catch (error: any) {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Failed to get content',
        );
      } finally {
        setPurchasing(false);
      }
      return;
    }

    // Paid content - show purchase confirmation with wallet info
    const price = content.pricing?.originalPrice || content.price || 0;
    Alert.alert(
      'Purchase Content',
      `Purchase "${content.title}" for ₹${price}?\n\nThis will be deducted from your wallet balance.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setPurchasing(true);
              await contentService.purchaseContent(contentId);
              Alert.alert('Success', 'Content purchased successfully! 🎉', [
                {
                  text: 'View Downloads',
                  onPress: () => navigation.navigate('MyPurchases'),
                },
                {text: 'OK', onPress: () => loadContentDetails()},
              ]);
            } catch (error: any) {
              const errorMsg = error.response?.data?.message || 'Purchase failed';
              if (errorMsg.includes('Insufficient') || errorMsg.includes('balance')) {
                Alert.alert(
                  'Insufficient Balance',
                  'Please recharge your wallet to purchase this content.',
                  [
                    {text: 'Cancel', style: 'cancel'},
                    {
                      text: 'Recharge Wallet',
                      onPress: () => navigation.navigate('Wallet'),
                    },
                  ],
                );
              } else {
                Alert.alert('Error', errorMsg);
              }
            } finally {
              setPurchasing(false);
            }
          },
        },
      ],
    );
  };

  const handleDownload = () => {
    if (!content || !content.isPurchased) return;
    navigation.navigate('MyPurchases');
  };

  const handlePreview = async () => {
    if (!content || !content.previewUrl) return;
    
    try {
      const supported = await Linking.canOpenURL(content.previewUrl);
      if (supported) {
        await Linking.openURL(content.previewUrl);
      } else {
        Alert.alert('Error', 'Cannot open preview');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open preview');
    }
  };

  const handleAddReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      Alert.alert('Review Required', 'Please write a review');
      return;
    }

    try {
      setSubmittingReview(true);
      await contentService.addReview(contentId, rating, reviewText.trim());
      Alert.alert('Success', 'Review added successfully!');
      setShowReviewModal(false);
      setRating(0);
      setReviewText('');
      // Reload content to show new review
      loadContentDetails();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!content) {
    return (
      <View style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={64} color="#EF4444" type="material-community" />
        <Text style={styles.errorText}>Content not found</Text>
      </View>
    );
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'file-pdf-box';
      case 'video':
        return 'video';
      case 'ebook':
        return 'book-open-variant';
      case 'notes':
        return 'notebook';
      case 'practice_set':
        return 'pencil-box-multiple';
      default:
        return 'file-document';
    }
  };

  const getDefaultImage = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'https://picsum.photos/200/300';
      case 'video':
        return 'https://via.placeholder.com/400/EF4444/FFFFFF?text=VIDEO+CONTENT';
      case 'ebook':
        return 'https://via.placeholder.com/400/8B5CF6/FFFFFF?text=EBOOK';
      case 'notes':
        return 'https://via.placeholder.com/400/10B981/FFFFFF?text=STUDY+NOTES';
      case 'practice_set':
        return 'https://via.placeholder.com/400/F59E0B/FFFFFF?text=PRACTICE+SET';
      default:
        return 'https://via.placeholder.com/400/6B7280/FFFFFF?text=CONTENT';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image with Back Button */}
        <View style={styles.coverContainer}>
          <Image
            source={{uri: content.thumbnail || getDefaultImage(content.contentType)}}
            style={styles.coverImage}
            resizeMode="cover"
            onError={(error) => {
              console.log('❌ [ContentDetails] Image load error:', error.nativeEvent.error);
            }}
          />
          {/* Back Button Overlay */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <CustomIcon
              name="arrow-left"
              size={18}
              color="#FFF"
              type="material-community"
            />
          </TouchableOpacity>
        </View>

        {/* Content Info */}
        <View style={styles.contentSection}>
          <View style={styles.header}>
            <View style={styles.typeTag}>
              <CustomIcon
                name={getContentIcon(content.contentType)}
                size={16}
                color="#6366F1"
                type="material-community"
              />
              <Text style={styles.typeText}>
                {content.contentType.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{content.title}</Text>

          {/* Creator Info */}
          <View style={styles.creatorRow}>
            <CustomIcon name="account-circle" size={24} color="#6B7280" type="material-community" />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>
                {content.createdBy?.name || content.creator?.name || 'Unknown'}
              </Text>
              {(content.createdBy?.creatorProfile || content.creator?.creatorProfile) && (
                <View style={styles.creatorStats}>
                  <CustomIcon name="star" size={14} color="#FFB800" type="material-community" />
                  <Text style={styles.creatorStatsText}>
                    {(content.createdBy?.creatorProfile?.rating || content.creator?.creatorProfile?.rating)?.toFixed(1) || '0.0'}
                  </Text>
                  <Text style={styles.creatorStatsText}>•</Text>
                  <Text style={styles.creatorStatsText}>
                    {content.createdBy?.creatorProfile?.totalContentSold || content.creator?.creatorProfile?.totalContentSold || 0} sold
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <CustomIcon name="star" size={20} color="#FFB800" type="material-community" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>
                  {(content.averageRating || content.rating || 0).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <CustomIcon name="download" size={20} color="#6366F1" type="material-community" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{content.totalSales || content.purchaseCount || 0}</Text>
                <Text style={styles.statLabel}>Purchases</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <CustomIcon name="eye" size={20} color="#10B981" type="material-community" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{content.totalViews || 0}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{content.description}</Text>
          </View>

          {/* Preview Button - Show only if preview available and not purchased */}
          {content.previewUrl && !content.isPurchased && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.previewButton}
                onPress={handlePreview}>
                <CustomIcon
                  name="eye"
                  size={20}
                  color="#6366F1"
                  type="material-community"
                />
                <Text style={styles.previewButtonText}>
                  View Sample Pages
                  {content.samplePages && content.samplePages.length > 0 && (
                    ` (${content.samplePages.length} pages)`
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {content.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Reviews ({content.totalReviews || content.reviewCount || 0})
              </Text>
              {content.isPurchased && (
                <TouchableOpacity
                  style={styles.addReviewButton}
                  onPress={() => setShowReviewModal(true)}>
                  <CustomIcon
                    name="star-plus"
                    size={16}
                    color="#FFF"
                    type="material-community"
                  />
                  <Text style={styles.addReviewButtonText}>Add Review</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Show Add Review prompt if no reviews and purchased */}
            {reviews.length === 0 && content.isPurchased && (
              <TouchableOpacity
                style={styles.emptyReviewPrompt}
                onPress={() => setShowReviewModal(true)}>
                <CustomIcon
                  name="star-outline"
                  size={48}
                  color="#6366F1"
                  type="material-community"
                />
                <Text style={styles.emptyReviewTitle}>Be the first to review!</Text>
                <Text style={styles.emptyReviewSubtitle}>
                  Share your experience with this content
                </Text>
              </TouchableOpacity>
            )}

            {reviews.length === 0 && !content.isPurchased ? (
              <Text style={styles.noReviews}>No reviews yet</Text>
            ) : (
              reviews.slice(0, 3).map((review, index) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewUser}>
                      <CustomIcon name="account-circle" size={32} color="#9CA3AF" type="material-community" />
                      <View>
                        <Text style={styles.reviewUserName}>
                          {review.user.name}
                        </Text>
                        {review.isVerifiedPurchase && (
                          <Text style={styles.verifiedBadge}>
                            ✓ Verified Purchase
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.ratingBadge}>
                      <CustomIcon name="star" size={14} color="#FFB800" type="material-community" />
                      <Text style={styles.ratingText}>{review.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.reviewText}>{review.review}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Purchase Button */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          {content.isFree ? (
            <Text style={styles.freeText}>FREE</Text>
          ) : (
            <>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>₹{content.pricing?.originalPrice || content.price || 0}</Text>
            </>
          )}
        </View>
        
        {isOwnContent ? (
          <View style={[styles.purchaseButton, styles.ownContentButton]}>
            <CustomIcon
              name="account-check"
              size={18}
              color="#6366F1"
              type="material-community"
            />
            <Text style={styles.ownContentText}>Your Content</Text>
          </View>
        ) : content.isPurchased ? (
          <TouchableOpacity
            style={[styles.purchaseButton, styles.downloadButton]}
            onPress={handleDownload}>
            <CustomIcon
              name="download"
              size={18}
              color="#FFF"
              type="material-community"
            />
            <Text style={styles.purchaseButtonText}>Download</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.purchaseButton, purchasing && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing}>
            {purchasing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <CustomIcon
                  name={content.isFree ? 'gift' : 'cart'}
                  size={18}
                  color="#FFF"
                  type="material-community"
                />
                <Text style={styles.purchaseButtonText}>
                  {content.isFree ? 'Get Free' : 'Buy Now'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Review</Text>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                style={styles.modalCloseButton}>
                <CustomIcon
                  name="close"
                  size={24}
                  color="#6B7280"
                  type="material-community"
                />
              </TouchableOpacity>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}>
                    <CustomIcon
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={36}
                      color={star <= rating ? '#FFB800' : '#D1D5DB'}
                      type="material-community"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review Text */}
            <View style={styles.reviewInputSection}>
              <Text style={styles.reviewInputLabel}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience with this content..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={reviewText}
                onChangeText={setReviewText}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitReviewButton,
                submittingReview && styles.buttonDisabled,
              ]}
              onPress={handleAddReview}
              disabled={submittingReview}>
              {submittingReview ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitReviewButtonText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  coverContainer: {
    position: 'relative',
    width: '100%',
    height: 240,
  },
  coverImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#E5E7EB',
  },
  backButton: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  creatorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  creatorStatsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 20,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6366F1',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    color: '#6B7280',
  },
  addReviewText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addReviewButtonText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyReviewPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyReviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  emptyReviewSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  noReviews: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  verifiedBadge: {
    fontSize: 11,
    color: '#10B981',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  freeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  purchaseButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadButton: {
    backgroundColor: '#10B981',
  },
  ownContentButton: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  ownContentText: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  purchaseButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewInputSection: {
    marginBottom: 24,
  },
  reviewInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  reviewInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 120,
  },
  submitReviewButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitReviewButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ContentDetailsScreen;


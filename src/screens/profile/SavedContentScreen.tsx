import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { RootState, AppDispatch } from '../../store';
import {
  fetchSavedContent,
  fetchSavedContentCount,
  removeSavedContent,
  setCurrentFilter,
} from '../../store/slices/savedContentSlice';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const SavedContentScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { items, counts, currentFilter, loading, pagination } = useSelector(
    (state: RootState) => state.savedContent
  );

  console.log('SavedContentScreen - items:', items);
  console.log('SavedContentScreen - counts:', counts);
  console.log('SavedContentScreen - loading:', loading);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
    dispatch(fetchSavedContentCount());
  }, [currentFilter]);

  const loadContent = () => {
    const contentType = currentFilter === 'all' ? undefined : currentFilter;
    dispatch(fetchSavedContent({ contentType, page: 1, limit: 20 }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    await dispatch(fetchSavedContentCount());
    setRefreshing(false);
  };

  const handleRemove = (id: string, contentType: string) => {
    Alert.alert(
      'Remove Saved Content',
      'Are you sure you want to remove this from saved items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeSavedContent(id)).unwrap();
              Alert.alert('Success', 'Content removed successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove content');
            }
          },
        },
      ]
    );
  };

  const handleContentPress = (item: any) => {
    if (item.contentType === 'post' && item.post) {
      // Navigate to post detail screen
      navigation.navigate('PostDetail', { postId: item.post._id });
    } else if (item.contentType === 'test' && item.test) {
      // Navigate to test detail
      navigation.navigate('TestDetail', { testId: item.test._id });
    } else if (item.contentType === 'pdf' && item.pdf) {
      // Navigate to PDF detail/viewer
      navigation.navigate('ContentDetail', { contentId: item.pdf._id });
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, currentFilter === 'all' && styles.tabActive]}
        onPress={() => dispatch(setCurrentFilter('all'))}
      >
        <Text style={[styles.tabText, currentFilter === 'all' && styles.tabTextActive]}>
          All ({counts?.total || 0})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentFilter === 'post' && styles.tabActive]}
        onPress={() => dispatch(setCurrentFilter('post'))}
      >
        <Icon
          name="chatbubble-outline"
          size={16}
          color={currentFilter === 'post' ? COLORS.primary : '#6B7280'}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.tabText, currentFilter === 'post' && styles.tabTextActive]}>
          Posts ({counts?.posts || 0})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentFilter === 'test' && styles.tabActive]}
        onPress={() => dispatch(setCurrentFilter('test'))}
      >
        <Icon
          name="document-text-outline"
          size={16}
          color={currentFilter === 'test' ? COLORS.primary : '#6B7280'}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.tabText, currentFilter === 'test' && styles.tabTextActive]}>
          Tests ({counts?.tests || 0})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, currentFilter === 'pdf' && styles.tabActive]}
        onPress={() => dispatch(setCurrentFilter('pdf'))}
      >
        <Icon
          name="document-attach-outline"
          size={16}
          color={currentFilter === 'pdf' ? COLORS.primary : '#6B7280'}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.tabText, currentFilter === 'pdf' && styles.tabTextActive]}>
          PDFs ({counts?.pdfs || 0})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderPostItem = (item: any) => {
    const post = item.post;
    if (!post) return null;

    const user = typeof post.userId === 'object' ? post.userId : null;
    const userName = user?.name || post.user?.name || 'User';
    const userAvatar = user?.avatar || user?.profilePicture || post.user?.avatar || 'https://via.placeholder.com/40';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleContentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.timestamp}>
                Saved {new Date(item.savedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item._id, item.contentType)}
            style={styles.removeButton}
          >
            <Icon name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.postContent} numberOfLines={3}>
          {post.content}
        </Text>

        {post.images && post.images.length > 0 && (
          <Image source={{ uri: post.images[0] }} style={styles.postImage} />
        )}
      </TouchableOpacity>
    );
  };

  const renderTestItem = (item: any) => {
    const test = item.test;
    if (!test) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleContentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.testTitle}>{test.title}</Text>
            <Text style={styles.testSubtitle}>
              {test.questionCount || 0} Questions • {test.duration || 0} mins
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item._id, item.contentType)}
            style={styles.removeButton}
          >
            <Icon name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {item.notes && (
          <View style={styles.notesContainer}>
            <Icon name="create-outline" size={14} color="#6B7280" />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{test.difficulty || 'Medium'}</Text>
            </View>
            {test.examType && (
              <View style={[styles.tag, { backgroundColor: COLORS.primary + '15' }]}>
                <Text style={[styles.tagText, { color: COLORS.primary }]}>{test.examType}</Text>
              </View>
            )}
          </View>
          <Text style={styles.savedDate}>
            {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPdfItem = (item: any) => {
    const pdf = item.pdf;
    if (!pdf) return null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleContentPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.pdfIcon}>
            <Icon name="document-attach" size={24} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.pdfTitle}>{pdf.title}</Text>
            <Text style={styles.pdfSubtitle}>
              {pdf.creator?.name || 'Unknown'} • {pdf.fileSize || 'N/A'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleRemove(item._id, item.contentType)}
            style={styles.removeButton}
          >
            <Icon name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {pdf.description && (
          <Text style={styles.pdfDescription} numberOfLines={2}>
            {pdf.description}
          </Text>
        )}

        {item.notes && (
          <View style={styles.notesContainer}>
            <Icon name="create-outline" size={14} color="#6B7280" />
            <Text style={styles.notesText} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            {pdf.price > 0 ? (
              <Text style={styles.price}>₹{pdf.price}</Text>
            ) : (
              <Text style={styles.freeTag}>Free</Text>
            )}
          </View>
          <Text style={styles.savedDate}>
            {new Date(item.savedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    switch (item.contentType) {
      case 'post':
        return renderPostItem(item);
      case 'test':
        return renderTestItem(item);
      case 'pdf':
        return renderPdfItem(item);
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="bookmark-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Saved Content</Text>
      <Text style={styles.emptyText}>
        {currentFilter === 'all'
          ? 'Save posts, tests, and PDFs to access them here'
          : `No saved ${currentFilter}s yet`}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Saved Content" onBackPress={() => navigation.goBack()} />

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content List */}
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />

      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  removeButton: {
    padding: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  testSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  savedDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  pdfIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pdfSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  pdfDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  freeTag: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default SavedContentScreen;

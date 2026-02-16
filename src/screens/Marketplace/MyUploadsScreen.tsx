import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import contentService, {Content} from '../../api/services/contentService';

const MyUploadsScreen = ({navigation}: any) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMyContent();
  }, []);

  const loadMyContent = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await contentService.getMyContent();
      setContents(response);
    } catch (error) {
      console.error('Failed to load my content:', error);
      Alert.alert('Error', 'Failed to load your uploads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadMyContent(true);
  };

  const handleDeleteContent = (contentId: string, title: string) => {
    Alert.alert(
      'Delete Content',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
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
              await contentService.deleteContent(contentId);
              Alert.alert('Success', 'Content deleted successfully');
              loadMyContent(); // Reload the list
            } catch (error: any) {
              console.error('Failed to delete content:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete content');
            }
          },
        },
      ],
    );
  };

  const handleEditContent = (contentId: string) => {
    navigation.navigate('EditContent', {contentId});
  };

  const renderContentCard = ({item}: {item: Content}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ContentDetails', {contentId: item._id})
      }>
      <Image
        source={{uri: item.thumbnail || 'https://via.placeholder.com/150'}}
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.isFree ? '#DBEAFE' : '#D1FAE5',
              },
            ]}>
            <Text
              style={[
                styles.statusText,
                {color: item.isFree ? '#1E40AF' : '#065F46'},
              ]}>
              {item.isFree ? 'FREE' : `₹${item.pricing?.originalPrice || item.price || 0}`}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <CustomIcon
              name="star"
              size={14}
              color="#FFB800"
              type="material-community"
            />
            <Text style={styles.statText}>
              {(item.averageRating || item.rating || 0).toFixed(1)}
            </Text>
          </View>
          <View style={styles.stat}>
            <CustomIcon
              name="download"
              size={14}
              color="#6366F1"
              type="material-community"
            />
            <Text style={styles.statText}>{item.totalSales || item.purchaseCount || 0}</Text>
          </View>
          <View style={styles.stat}>
            <CustomIcon
              name="eye"
              size={14}
              color="#10B981"
              type="material-community"
            />
            <Text style={styles.statText}>{item.totalViews || 0}</Text>
          </View>
          <View style={styles.stat}>
            <CustomIcon
              name="comment"
              size={14}
              color="#F59E0B"
              type="material-community"
            />
            <Text style={styles.statText}>{item.reviewCount || 0}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>Earnings:</Text>
            <Text style={styles.earningsValue}>
              ₹{((item.price || 0) * (item.purchaseCount || 0) * 0.7).toFixed(0)}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditContent(item._id)}>
              <CustomIcon name="pencil" size={16} color="#6366F1" type="material-community" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteContent(item._id, item.title)}>
              <CustomIcon name="delete" size={16} color="#EF4444" type="material-community" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                navigation.navigate('ContentDetails', {contentId: item._id})
              }>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <CustomIcon
            name="arrow-left"
            size={24}
            color="#1F2937"
            type="material-community"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Uploads</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('UploadContent')}
          style={styles.uploadButton}>
          <CustomIcon
            name="plus"
            size={24}
            color="#6366F1"
            type="material-community"
          />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <CustomIcon
            name="package-variant"
            size={24}
            color="#6366F1"
            type="material-community"
          />
          <Text style={styles.summaryValue}>{contents.length}</Text>
          <Text style={styles.summaryLabel}>Total Items</Text>
        </View>
        <View style={styles.summaryCard}>
          <CustomIcon
            name="download"
            size={24}
            color="#10B981"
            type="material-community"
          />
          <Text style={styles.summaryValue}>
            {contents.reduce((sum, c) => sum + (c.totalSales || c.purchaseCount || 0), 0)}
          </Text>
          <Text style={styles.summaryLabel}>Total Sales</Text>
        </View>
        <View style={styles.summaryCard}>
          <CustomIcon
            name="currency-inr"
            size={24}
            color="#F59E0B"
            type="material-community"
          />
          <Text style={styles.summaryValue}>
            ₹
            {contents
              .reduce(
                (sum, c) => sum + (c.pricing?.originalPrice || c.price || 0) * (c.totalSales || c.purchaseCount || 0) * 0.7,
                0,
              )
              .toFixed(0)}
          </Text>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
        </View>
      </View>

      {/* Content List */}
      {contents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CustomIcon
            name="cloud-upload"
            size={80}
            color="#D1D5DB"
            type="material-community"
          />
          <Text style={styles.emptyTitle}>No Content Yet</Text>
          <Text style={styles.emptyText}>
            Start uploading your study materials to earn money
          </Text>
          <TouchableOpacity
            style={styles.uploadCtaButton}
            onPress={() => navigation.navigate('UploadContent')}>
            <CustomIcon
              name="plus"
              size={20}
              color="#FFF"
              type="material-community"
            />
            <Text style={styles.uploadCtaText}>Upload Content</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contents}
          renderItem={renderContentCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  uploadButton: {
    padding: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  earningsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  uploadCtaButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  uploadCtaText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyUploadsScreen;

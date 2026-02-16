import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import contentService, {Content} from '../../api/services/contentService';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

const MarketplaceScreen = ({navigation}: any) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [priceRange, setPriceRange] = useState({min: '', max: ''});
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [availableExams, setAvailableExams] = useState<any[]>([]);

  const contentTypes = [
    {label: 'All', value: 'all', icon: 'view-grid'},
    {label: 'PDF', value: 'pdf', icon: 'file-pdf-box'},
    {label: 'Video', value: 'video', icon: 'video'},
    {label: 'Notes', value: 'notes', icon: 'notebook'},
    {label: 'Practice', value: 'practice_set', icon: 'pencil'},
  ];

  const sortOptions = [
    {label: 'Latest', value: 'latest'},
    {label: 'Popular', value: 'popular'},
    {label: 'Top Rated', value: 'rating'},
    {label: 'Price: Low to High', value: 'price_low'},
    {label: 'Price: High to Low', value: 'price_high'},
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadContents(1);
  }, [selectedType, search, sortBy, selectedExam, priceRange.min, priceRange.max]);

  const fetchExams = async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.EXAMS);
      if (response.data?.data) {
        const examsWithAll = [
          {_id: 'all', name: 'All Exams'},
          ...response.data.data
        ];
        setAvailableExams(examsWithAll);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      // Fallback
      setAvailableExams([
        {_id: 'all', name: 'All Exams'},
        {_id: 'upsc', name: 'UPSC'},
        {_id: 'ssc', name: 'SSC'},
        {_id: 'banking', name: 'Banking'},
        {_id: 'railways', name: 'Railways'},
      ]);
    }
  };

  const clearAllFilters = () => {
    setSelectedType('all');
    setSelectedExam('all');
    setSortBy('latest');
    setPriceRange({min: '', max: ''});
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadContents(page + 1);
    }
  };

  const handleRefresh = () => {
    loadContents(1, true);
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{padding: 20}}>
        <ActivityIndicator size="small" color="#6366F1" />
      </View>
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedType !== 'all') count++;
    if (selectedExam !== 'all') count++;
    if (sortBy !== 'latest') count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  };

  const loadContents = async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const filters: any = {page: pageNum, limit: 20};
      
      if (selectedType !== 'all') filters.type = selectedType;
      if (search) filters.search = search;
      if (selectedExam !== 'all') filters.examId = selectedExam;
      if (priceRange.min) filters.minPrice = Number(priceRange.min);
      if (priceRange.max) filters.maxPrice = Number(priceRange.max);
      
      // Sorting
      if (sortBy === 'price_low') {
        filters.sortBy = 'price';
        filters.sortOrder = 'asc';
      } else if (sortBy === 'price_high') {
        filters.sortBy = 'price';
        filters.sortOrder = 'desc';
      } else if (sortBy === 'popular') {
        filters.sortBy = 'purchaseCount';
        filters.sortOrder = 'desc';
      } else if (sortBy === 'rating') {
        filters.sortBy = 'rating';
        filters.sortOrder = 'desc';
      } else {
        filters.sortBy = 'createdAt';
        filters.sortOrder = 'desc';
      }

      const response = await contentService.getContents(filters);
      
      // Handle nested data structure: response = { data: { data: [...], pagination: {...} } }
      const responseData = (response as any).data || response;
      const contentsData = responseData.data || responseData || [];
      const pagination = responseData.pagination;
      
      if (pageNum === 1 || isRefresh) {
        setContents(contentsData);
      } else {
        setContents(prev => [...prev, ...contentsData]);
      }
      
      setHasMore(pagination?.hasNextPage || false);
      setPage(pageNum);
    } catch (error) {
      console.error('❌ [Marketplace] Failed to load contents:', error);
      if (pageNum === 1) {
        setContents([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const renderContentCard = ({item}: {item: Content}) => {
    const creatorName = item.createdBy?.name || item.creator?.name || 'Unknown';
    const rating = item.averageRating || item.rating || 0;
    const reviewCount = item.totalReviews || item.reviewCount || 0;
    const purchaseCount = item.totalSales || item.purchaseCount || 0;
    const price = item.pricing?.originalPrice || item.price || 0;
    
    // Default image based on content type
    const getDefaultImage = (type: string) => {
      switch (type) {
        case 'pdf':
          return 'https://via.placeholder.com/150/6366F1/FFFFFF?text=PDF';
        case 'video':
          return 'https://via.placeholder.com/150/EF4444/FFFFFF?text=VIDEO';
        case 'ebook':
          return 'https://via.placeholder.com/150/8B5CF6/FFFFFF?text=EBOOK';
        case 'notes':
          return 'https://via.placeholder.com/150/10B981/FFFFFF?text=NOTES';
        case 'practice_set':
          return 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=PRACTICE';
        default:
          return 'https://via.placeholder.com/150/6B7280/FFFFFF?text=CONTENT';
      }
    };
    
    const thumbnailUrl = item.thumbnail || getDefaultImage(item.contentType);
    
    console.log('🎨 [Marketplace] Rendering card:', {
      title: item.title,
      thumbnail: item.thumbnail,
      thumbnailUrl,
      creatorName,
      rating,
      reviewCount,
      purchaseCount,
      price,
      isFree: item.isFree,
    });
    
    return (
      <View style={styles.card}>
        <Image
          source={{uri: thumbnailUrl}}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.creator} numberOfLines={1}>
            by {creatorName}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <CustomIcon name="star" size={12} color="#FFB800" type="material-community" />
              <Text style={styles.statText}>
                {rating.toFixed(1)}
              </Text>
            </View>
            <View style={styles.stat}>
              <CustomIcon name="download" size={12} color="#666" type="material-community" />
              <Text style={styles.statText}>{purchaseCount}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              {item.isFree ? (
                <Text style={styles.freeTag}>FREE</Text>
              ) : (
                <Text style={styles.price}>₹{price}</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.viewButton}
              onPress={() => navigation.navigate('ContentDetails', {contentId: item._id})}>
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showFilterModal}
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <CustomIcon name="close" size={24} color="#1F2937" type="material-community" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Content Type Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Content Type</Text>
                <View style={styles.filterOptionsGrid}>
                  {contentTypes.map(type => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.filterOption,
                        selectedType === type.value && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedType(type.value)}>
                      <CustomIcon
                        name={type.icon}
                        size={18}
                        color={selectedType === type.value ? '#6366F1' : '#666'}
                        type="material-community"
                      />
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedType === type.value && styles.filterOptionTextActive,
                        ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exam Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Exam Category</Text>
                <View style={styles.filterOptionsGrid}>
                  {availableExams.map(exam => (
                    <TouchableOpacity
                      key={exam._id}
                      style={[
                        styles.filterOption,
                        selectedExam === exam._id && styles.filterOptionActive,
                      ]}
                      onPress={() => setSelectedExam(exam._id)}>
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedExam === exam._id && styles.filterOptionTextActive,
                        ]}>
                        {exam.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sort By Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.filterOptionsGrid}>
                  {sortOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.filterOption,
                        sortBy === option.value && styles.filterOptionActive,
                      ]}
                      onPress={() => setSortBy(option.value)}>
                      <Text
                        style={[
                          styles.filterOptionText,
                          sortBy === option.value && styles.filterOptionTextActive,
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceInputRow}>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={priceRange.min}
                    onChangeText={text => setPriceRange({...priceRange, min: text})}
                  />
                  <Text style={styles.priceSeparator}>-</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={priceRange.max}
                    onChangeText={text => setPriceRange({...priceRange, max: text})}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={clearAllFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => {
                  setShowFilterModal(false);
                }}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Marketplace</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('MyUploads')}>
              <CustomIcon
                name="package-variant"
                size={20}
                color="#6366F1"
                type="material-community"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => navigation.navigate('UploadContent')}>
              <CustomIcon
                name="plus"
                size={18}
                color="#FFF"
                type="material-community"
              />
              <Text style={styles.uploadButtonText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <CustomIcon
            name="magnify"
            size={20}
            color="#999"
            type="material-community"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search PDF notes, study materials..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#999"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <CustomIcon
                name="close-circle"
                size={20}
                color="#999"
                type="material-community"
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.filterIconButton}
            onPress={() => setShowFilterModal(true)}
          >
            <CustomIcon
              name="filter-variant"
              size={20}
              color="#6366F1"
              type="material-community"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar with Selected Chips */}
      <View style={styles.filterBar}>
        {/* Active Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersContainer}
          style={{flex: 1}}>
          {selectedType !== 'all' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>
                {contentTypes.find(t => t.value === selectedType)?.label}
              </Text>
              <TouchableOpacity onPress={() => setSelectedType('all')}>
                <CustomIcon name="close-circle" size={16} color="#6366F1" type="material-community" />
              </TouchableOpacity>
            </View>
          )}
          {selectedExam !== 'all' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>
                {availableExams.find(e => e._id === selectedExam)?.name}
              </Text>
              <TouchableOpacity onPress={() => setSelectedExam('all')}>
                <CustomIcon name="close-circle" size={16} color="#6366F1" type="material-community" />
              </TouchableOpacity>
            </View>
          )}
          {sortBy !== 'latest' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>
                {sortOptions.find(s => s.value === sortBy)?.label}
              </Text>
              <TouchableOpacity onPress={() => setSortBy('latest')}>
                <CustomIcon name="close-circle" size={16} color="#6366F1" type="material-community" />
              </TouchableOpacity>
            </View>
          )}
          {(priceRange.min || priceRange.max) && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterChipText}>
                ₹{priceRange.min || '0'} - ₹{priceRange.max || '∞'}
              </Text>
              <TouchableOpacity onPress={() => setPriceRange({min: '', max: ''})}>
                <CustomIcon name="close-circle" size={16} color="#6366F1" type="material-community" />
              </TouchableOpacity>
            </View>
          )}
          {getActiveFiltersCount() > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Content List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : contents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CustomIcon name="package-variant" size={64} color="#DDD" type="material-community" />
          <Text style={styles.emptyText}>No content found</Text>
        </View>
      ) : (
        <FlatList
          data={contents}
          renderItem={renderContentCard}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshing={refreshing}
          onRefresh={handleRefresh}
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
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 0,
    borderBottomColor: '#EEE',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  filterIconButton: {
    padding: 4,
  },
  // Filter Bar Styles
  filterBar: {
    backgroundColor: '#FFF',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    paddingRight: 16,
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  activeFilterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6366F1',
  },
  clearAllButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  filterOptionActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#6366F1',
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceSeparator: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 12,
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
    flex: 1,
    marginHorizontal: 4,
    maxWidth: '48%',
  },
  thumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  cardContent: {
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    minHeight: 36,
  },
  creator: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statText: {
    fontSize: 11,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  freeTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10B981',
  },
  viewButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 12,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});

export default MarketplaceScreen;

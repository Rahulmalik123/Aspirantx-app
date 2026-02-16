import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import subjectService from '../../api/services/subjectService';
import { Topic } from '../../types/subject.types';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

const TopicSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subjectId, subjectName, examId, examName } = route.params || {};

  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, [subjectId]);

  useEffect(() => {
    filterTopics();
  }, [searchQuery, topics]);

  const fetchTopics = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      console.log('📥 [TopicSelection] Fetching topics for subjectId:', subjectId);
      const response = await subjectService.getTopics(subjectId, examId);

      console.log('📥 [TopicSelection] Received topics:', response.data?.length);
      setTopics(response.data || []);
    } catch (error: any) {
      console.error('❌ [TopicSelection] Error fetching topics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTopics(true);
  };

  const filterTopics = () => {
    if (!searchQuery.trim()) {
      setFilteredTopics(topics);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = topics.filter(
      (topic) =>
        topic.name.toLowerCase().includes(query) ||
        topic.code.toLowerCase().includes(query) ||
        topic.description?.toLowerCase().includes(query)
    );
    setFilteredTopics(filtered);
  };

  const toggleTopicSelection = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(filteredTopics.map((topic) => topic._id));
    }
    setSelectAll(!selectAll);
  };

  const handleViewTests = () => {
    // Navigate to Tests filtered by selected topics
    navigation.navigate(ROUTES.TEST_LIST, {
      examId,
      examName,
      subjectId,
      subjectName,
      topicIds: selectedTopics,
      type: 'subject_test',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const renderTopicCard = ({ item }: { item: Topic }) => {
    const isSelected = selectedTopics.includes(item._id);

    return (
      <TouchableOpacity
        style={[styles.topicCard, isSelected && styles.topicCardSelected]}
        onPress={() => toggleTopicSelection(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.topicHeader}>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <CustomIcon name="checkmark" size={16} color={COLORS.white} />}
            </View>
          </View>

          <View style={styles.topicInfo}>
            <Text style={styles.topicName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.topicDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.topicStats}>
          <View style={styles.statItem}>
            <CustomIcon name="document-text-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.totalQuestions} Questions</Text>
          </View>
        </View>

        {(item.easyQuestions || item.mediumQuestions || item.hardQuestions) && (
          <View style={styles.difficultyContainer}>
            {item.easyQuestions > 0 && (
              <View style={styles.difficultyBadge}>
                <View style={[styles.difficultyDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.difficultyText}>Easy: {item.easyQuestions}</Text>
              </View>
            )}
            {item.mediumQuestions > 0 && (
              <View style={styles.difficultyBadge}>
                <View style={[styles.difficultyDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.difficultyText}>Medium: {item.mediumQuestions}</Text>
              </View>
            )}
            {item.hardQuestions > 0 && (
              <View style={styles.difficultyBadge}>
                <View style={[styles.difficultyDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.difficultyText}>Hard: {item.hardQuestions}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CustomIcon name="list-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Topics Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No topics match your search criteria'
          : 'No topics available for this subject'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={subjectName} showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading topics...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={subjectName} showBack />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <CustomIcon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <CustomIcon name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Select All */}
        {filteredTopics.length > 0 && (
          <TouchableOpacity style={styles.selectAllContainer} onPress={toggleSelectAll}>
            <View style={[styles.checkbox, selectAll && styles.checkboxSelected]}>
              {selectAll && <CustomIcon name="checkmark" size={16} color={COLORS.white} />}
            </View>
            <Text style={styles.selectAllText}>
              {selectAll ? 'Deselect All' : 'Select All'}
            </Text>
            <Text style={styles.selectedCount}>
              ({selectedTopics.length} selected)
            </Text>
          </TouchableOpacity>
        )}

        {/* Topics List */}
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) => item._id}
          renderItem={renderTopicCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bottom Action Button */}
      {selectedTopics.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.viewTestsButton} onPress={handleViewTests}>
            <Text style={styles.viewTestsButtonText}>
              View Tests ({selectedTopics.length} {selectedTopics.length === 1 ? 'Topic' : 'Topics'})
            </Text>
            <CustomIcon name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  selectAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  selectedCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  topicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  topicCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}05`,
  },
  topicHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  topicStats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  difficultyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.background,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  viewTestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  viewTestsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginRight: 8,
  },
});

export default TopicSelectionScreen;

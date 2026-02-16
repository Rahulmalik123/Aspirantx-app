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
import { Subject } from '../../types/subject.types';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

const SubjectListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId, examName } = route.params || {};

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [examId]);

  useEffect(() => {
    filterSubjects();
  }, [searchQuery, subjects]);

  const fetchSubjects = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      console.log('📥 [SubjectList] Fetching subjects for examId:', examId);
      const response = await subjectService.getSubjects(examId);
      
      console.log('📥 [SubjectList] Received subjects:', response.data?.length);
      setSubjects(response.data || []);
    } catch (error: any) {
      console.error('❌ [SubjectList] Error fetching subjects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects(true);
  };

  const filterSubjects = () => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query)
    );
    setFilteredSubjects(filtered);
  };

  const handleSubjectPress = (subject: Subject) => {
    // Navigate to Subject-wise Tests list for this subject
    navigation.navigate(ROUTES.TEST_LIST, {
      examId,
      examName,
      subjectId: subject._id,
      subjectName: subject.name,
      type: 'subject_test',
    });
  };

  const handleViewTopics = (subject: Subject) => {
    // Navigate to Topics screen
    navigation.navigate(ROUTES.TOPIC_SELECTION, {
      subjectId: subject._id,
      subjectName: subject.name,
      examId,
      examName,
    });
  };

  const renderSubjectCard = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => handleSubjectPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.subjectHeader}>
        <View style={styles.subjectIconContainer}>
          <CustomIcon name="book-outline" size={28} color={COLORS.primary} />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.subjectDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.subjectStats}>
        <View style={styles.statItem}>
          <CustomIcon name="document-text-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.totalQuestions} Questions</Text>
        </View>
        <View style={styles.statItem}>
          <CustomIcon name="file-tray-full-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.totalTopics} Topics</Text>
        </View>
      </View>

      <View style={styles.subjectActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={(e) => {
            e.stopPropagation();
            handleViewTopics(item);
          }}
        >
          <CustomIcon name="list-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>View Topics</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={(e) => {
            e.stopPropagation();
            handleSubjectPress(item);
          }}
        >
          <Text style={styles.primaryButtonText}>View Tests</Text>
          <CustomIcon name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <CustomIcon name="book-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No Subjects Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No subjects match your search criteria'
          : 'No subjects available for this exam'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={`${examName} - Subjects`} showBackButton onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={`${examName} - Subjects`} showBackButton onBackPress={() => navigation.goBack()} />

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <CustomIcon name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
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

        {/* Subjects List */}
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item._id}
          renderItem={renderSubjectCard}
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
    marginBottom: 16,
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
  listContent: {
    paddingBottom: 16,
  },
  subjectCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  subjectHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  subjectIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  subjectStats: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  subjectActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    marginRight: 6,
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
});

export default SubjectListScreen;

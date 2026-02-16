import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import testService, { Test } from '../../api/services/testService';
import subjectService from '../../api/services/subjectService';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

const TestListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId, examName, subjectId, subjectName, topicIds, type } = route.params || {};
  
  const [tests, setTests] = useState<Test[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mock_test' | 'topic_test' | 'daily_quiz' | 'subject_test'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  useEffect(() => {
    // Set initial filter based on type param
    if (type === 'subject_test') {
      setFilter('subject_test');
    }
    fetchTests();
  }, []);

  // Refresh tests when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [TestList] Screen focused, refreshing tests...');
      fetchTests();
    }, [examId])
  );

  useEffect(() => {
    filterTests();
  }, [filter, searchQuery, tests]);

  const fetchTests = async () => {
    try {
      console.log('📥 [TestList] Fetching tests for examId:', examId);
      console.log('📥 [TestList] Type filter:', type);
      console.log('📥 [TestList] Subject filter:', subjectId);
      
      // If type is 'subject_test', use subjectService instead
      if (type === 'subject_test') {
        const testsData = await subjectService.getSubjectTests(
          examId,
          subjectId,
          true, // isActive
          undefined, // isPaid (show all)
          1,
          100
        );
        
        console.log('📥 [TestList] Received subject tests:', testsData.data?.length);
        
        // Filter by topics if specified
        let filteredTests = testsData.data || [];
        if (topicIds && topicIds.length > 0) {
          filteredTests = filteredTests.filter((test: any) =>
            test.sections?.some((section: any) =>
              topicIds.includes(section.topicId)
            )
          );
        }
        
        const testsWithAttemptInfo = filteredTests.map((test: any) => ({
          ...test,
          userAttempted: test.attemptInfo?.isAttempted || false,
          canRetake: test.attemptInfo?.canRetake !== false,
          attemptId: test.attemptInfo?.attemptId,
        }));
        
        setTests(testsWithAttemptInfo);
        return;
      }
      
      // Fetch both regular tests and daily quizzes in parallel
      const [testsData, dailyQuizzesData] = await Promise.all([
        testService.getTests(examId, type),
        practiceService.getTodayQuizzes().catch(() => ({ data: [] })) // Gracefully handle errors
      ]);
      
      console.log('📥 [TestList] Received tests:', testsData.data?.length);
      console.log('📥 [TestList] Daily quizzes response:', dailyQuizzesData);
      
      // Map attemptInfo to userAttempted for regular tests
      const testsWithAttemptInfo = (testsData.data || []).map((test: any) => ({
        ...test,
        userAttempted: test.attemptInfo?.isAttempted || false,
        canRetake: test.attemptInfo?.canRetake !== false,
        attemptId: test.attemptInfo?.attemptId,
      }));
      
      // Transform daily quizzes to match Test interface
      // Handle both {data: []} and {data: {quizzes: []}} response formats
      const dailyQuizzesArray = Array.isArray(dailyQuizzesData?.data) 
        ? dailyQuizzesData.data 
        : (dailyQuizzesData?.data?.quizzes || dailyQuizzesData?.data?.data || []);
      
      console.log('📥 [TestList] Daily quizzes array:', dailyQuizzesArray?.length);
      
      const dailyQuizzes = (dailyQuizzesArray || []).map((quiz: any) => ({
        _id: quiz._id,
        title: quiz.title || 'Daily Quiz',
        description: quiz.description || `${quiz.totalQuestions} questions from ${quiz.examName || 'various topics'}`,
        exam: quiz.exam || examId,
        type: 'daily_quiz' as const,
        difficulty: quiz.difficulty,
        duration: quiz.duration || 30,
        totalQuestions: quiz.totalQuestions || 10,
        totalMarks: quiz.totalMarks || quiz.totalQuestions || 10,
        negativeMarking: quiz.negativeMarking || false,
        isPaid: false,
        price: 0,
        totalAttempts: quiz.totalAttempts || 0,
        userAttempted: quiz.status === 'completed',
        userPurchased: true,
        isActive: quiz.status !== 'expired',
        attemptId: quiz.attemptId,
      }));
      
      // Merge both arrays
      const allTests = [...testsWithAttemptInfo, ...dailyQuizzes];
      
      console.log('📥 [TestList] Tests with userAttempted:', allTests.filter((t: any) => t.userAttempted).length);
      console.log('📊 [TestList] Test types breakdown:', {
        total: allTests.length,
        daily_quiz: allTests.filter((t: any) => t.type === 'daily_quiz').length,
        mock_test: allTests.filter((t: any) => t.type === 'mock_test').length,
        topic_test: allTests.filter((t: any) => t.type === 'topic_test').length,
      });
      console.log('📋 [TestList] All tests:', JSON.stringify(allTests.map((t: any) => ({ id: t._id, title: t.title, type: t.type })), null, 2));
      setTests(allTests);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let result = tests;
    
    if (filter !== 'all') {
      result = result.filter(test => test.type === filter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(test => 
        test.title.toLowerCase().includes(query) ||
        test.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredTests(result);
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case 'daily_quiz': return 'calendar';
      case 'mock_test': return 'clipboard';
      case 'topic_test': return 'book';
      case 'subject_test': return 'library';
      // case 'pyq': return 'time'; // PYQ - Temporarily Commented Out
      default: return 'document-text';
    }
  };

  const getTestTypeIconColor = (type: string) => {
    switch (type) {
      case 'daily_quiz': return '#1E40AF';
      case 'mock_test': return '#991B1B';
      case 'topic_test': return '#6B21A8';
      case 'subject_test': return '#059669';
      default: return '#6B7280';
    }
  };

  const getTestTypeLabel = (type: string) => {
    switch (type) {
      case 'daily_quiz': return 'Daily Quiz';
      case 'mock_test': return 'Mock Test';
      case 'topic_test': return 'Topic Test';
      case 'subject_test': return 'Subject Test';
      // case 'pyq': return 'PYQ'; // PYQ - Temporarily Commented Out
      default: return 'Test';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderTestCard = ({ item }: { item: Test }) => (
    <TouchableOpacity
      style={styles.testCard}
      onPress={() => {
        // If test is completed and has attemptId, show modal with options
        if (item.userAttempted && item.attemptId) {
          setSelectedTest(item);
          setShowOptionsModal(true);
        } else {
          navigation.navigate('TestDetails', { testId: item._id });
        }
      }}
      activeOpacity={0.7}
    >
      {/* Type Badge */}
      <View style={styles.typeContainer}>
        <View style={[styles.typeBadge, { 
          backgroundColor: item.type === 'daily_quiz' ? '#DBEAFE' : 
                          item.type === 'mock_test' ? '#FEE2E2' : 
                          item.type === 'subject_test' ? '#D1FAE5' :
                          /* item.type === 'pyq' ? '#FEF3C7' : */ '#F3E8FF'
        }]}>
          <CustomIcon 
            name={getTestTypeIcon(item.type)} 
            size={14} 
            color={getTestTypeIconColor(item.type)} 
          />
          <Text style={[styles.typeText, {
            color: item.type === 'daily_quiz' ? '#1E40AF' :
                   item.type === 'mock_test' ? '#991B1B' :
                   item.type === 'subject_test' ? '#059669' :
                   /* item.type === 'pyq' ? '#92400E' : */ '#6B21A8'
          }]}>
            {getTestTypeLabel(item.type)}
          </Text>
        </View>
        {item.isPaid && !item.userPurchased && (
          <View style={styles.priceBadge}>
            <CustomIcon name="cash-outline" size={12} color="#92400E" />
            <Text style={styles.priceText}>{item.price} coins</Text>
          </View>
        )}
      </View>

      {/* Test Info */}
      <View style={styles.testHeader}>
        <Text style={styles.testTitle} numberOfLines={2}>{item.title}</Text>
        {item.difficulty && (
          <View style={[styles.difficultyBadge, { 
            backgroundColor: getDifficultyColor(item.difficulty) + '15' 
          }]}>
            <Text style={[styles.difficultyText, { 
              color: getDifficultyColor(item.difficulty) 
            }]}>
              {item.difficulty}
            </Text>
          </View>
        )}
      </View>

      {item.description && (
        <Text style={styles.testDesc} numberOfLines={2}>{item.description}</Text>
      )}

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <CustomIcon name="document-text-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.totalQuestions} Qs</Text>
        </View>
        <View style={styles.statItem}>
          <CustomIcon name="time-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.duration} min</Text>
        </View>
        <View style={styles.statItem}>
          <CustomIcon name="trophy-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.totalMarks} marks</Text>
        </View>
        <View style={styles.statItem}>
          <CustomIcon name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.totalAttempts || 0}</Text>
        </View>
      </View>

      {/* Status Indicators */}
      {item.userAttempted && (
        <View style={styles.statusBadge}>
          <CustomIcon name="checkmark-circle" size={14} color="#10B981" />
          <Text style={styles.statusText}>Completed</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <CustomIcon name="search-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tests..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <CustomIcon name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All Tests', icon: 'list-outline' },
            { key: 'daily_quiz', label: 'Daily Quiz', icon: 'calendar-outline' },
            { key: 'mock_test', label: 'Mock Tests', icon: 'file-tray-full-outline' },
            { key: 'topic_test', label: 'Topic Tests', icon: 'bookmark-outline' },
            ...(type === 'subject_test' ? [{ key: 'subject_test', label: 'Subject Tests', icon: 'library-outline' }] : []),
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key as any)}
              activeOpacity={0.7}
            >
              <CustomIcon 
                name={item.icon} 
                size={16} 
                color={filter === item.key ? COLORS.white : '#6B7280'} 
              />
              <Text style={[
                styles.filterChipText, 
                filter === item.key && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} found
        </Text>
      </View>
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <CustomIcon name="document-text-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Tests Found</Text>
      <Text style={styles.emptyDesc}>
        {searchQuery ? 'Try adjusting your search' : 'No tests available for this exam yet'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={subjectName ? `${subjectName} Tests` : examName || 'Test Series'} 
        showBackButton
        onBackPress={() => navigation.goBack()} 
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading tests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTests}
          renderItem={renderTestCard}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={filteredTests.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Options Modal for Completed Tests */}
      <Modal
        visible={showOptionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTest?.title}</Text>
              <TouchableOpacity onPress={() => setShowOptionsModal(false)}>
                <CustomIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={async () => {
                setShowOptionsModal(false);
                if (selectedTest?.attemptId) {
                  try {
                    const result = await testService.getTestResult(selectedTest.attemptId);
                    navigation.navigate('TestResult', {
                      attemptId: selectedTest.attemptId,
                      testId: selectedTest._id,
                      result: result,
                    });
                  } catch (error) {
                    console.error('Error fetching result:', error);
                  }
                }
              }}
            >
              <CustomIcon name="trophy" size={24} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>View Result</Text>
              <CustomIcon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setShowOptionsModal(false);
                navigation.navigate('TestDetails', { testId: selectedTest?._id });
              }}
            >
              <CustomIcon name="document-text" size={24} color={COLORS.primary} />
              <Text style={styles.modalOptionText}>View Details</Text>
              <CustomIcon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalOption, styles.modalCancelOption]}
              onPress={() => setShowOptionsModal(false)}
            >
              <CustomIcon name="close-circle" size={24} color="#EF4444" />
              <Text style={[styles.modalOptionText, styles.modalCancelText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Poppins-Regular',
    padding: 0,
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyList: {
    flexGrow: 1,
  },
  testCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    fontFamily: 'Poppins-SemiBold',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  testTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
    textTransform: 'capitalize',
  },
  testDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Poppins-Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Medium',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    fontFamily: 'Poppins-SemiBold',
    flex: 1,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Poppins-Medium',
    flex: 1,
  },
  modalCancelOption: {
    backgroundColor: '#FEE2E2',
  },
  modalCancelText: {
    color: '#EF4444',
  },
});

export default TestListScreen;

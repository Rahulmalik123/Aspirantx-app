import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from '../../components/CustomIcon';
import Header from '../../components/common/Header';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';

interface Question {
  _id: string;
  question: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const BookmarkedQuestionsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.BOOKMARKS);
      const bookmarkedQuestions = response.data.data || [];
      setQuestions(bookmarkedQuestions);
      
      // Extract unique subjects
      const uniqueSubjects = ['all', ...new Set(bookmarkedQuestions.map((q: Question) => q.subject))];
      setSubjects(uniqueSubjects);
    } catch (error: any) {
      console.error('Failed to fetch bookmarks:', error.response?.data?.message || error.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookmarks();
    setRefreshing(false);
  };

  const removeBookmark = async (questionId: string) => {
    try {
      await apiClient.delete(`${ENDPOINTS.BOOKMARKS}/${questionId}`);
      setQuestions(questions.filter(q => q._id !== questionId));
    } catch (error: any) {
      console.error('Failed to remove bookmark:', error.response?.data?.message || error.message);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredQuestions = selectedSubject === 'all' 
    ? questions 
    : questions.filter(q => q.subject === selectedSubject);

  const renderQuestion = ({ item }: { item: Question }) => (
    <View style={styles.questionCard}>
      {/* Header */}
      <View style={styles.questionHeader}>
        <View style={styles.questionMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
              {item.difficulty.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
        <TouchableOpacity onPress={() => removeBookmark(item._id)} style={styles.removeButton}>
          <CustomIcon name="bookmark" size={24} color="#6366F1" type="material-community" />
        </TouchableOpacity>
      </View>

      {/* Question Text */}
      <Text style={styles.questionText}>{item.question}</Text>

      {/* Topic */}
      <View style={styles.topicContainer}>
        <CustomIcon name="book-outline" size={16} color="#6B7280" type="material-community" />
        <Text style={styles.topicText}>{item.topic}</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {item.options.map((option, index) => (
          <View
            key={index}
            style={[
              styles.option,
              index === item.correctAnswer && styles.correctOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                index === item.correctAnswer && styles.correctOptionText,
              ]}
            >
              {String.fromCharCode(65 + index)}. {option}
            </Text>
            {index === item.correctAnswer && (
              <CustomIcon name="check-circle" size={20} color="#10B981" type="material-community" />
            )}
          </View>
        ))}
      </View>

      {/* Explanation */}
      {item.explanation && (
        <View style={styles.explanationContainer}>
          <CustomIcon name="lightbulb-outline" size={18} color="#F59E0B" type="material-community" />
          <Text style={styles.explanationText}>{item.explanation}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Saved Questions"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerRight}>
            <Text style={styles.countBadge}>{questions.length}</Text>
          </View>
        }
      />

      {/* Subject Filter */}
      {subjects.length > 1 && (
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={subjects}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedSubject === item && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedSubject(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedSubject === item && styles.activeFilterChipText,
                  ]}
                >
                  {item === 'all' ? 'All' : item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Questions List */}
      {filteredQuestions.length > 0 ? (
        <FlatList
          data={filteredQuestions}
          keyExtractor={(item) => item._id}
          renderItem={renderQuestion}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#6366F1']} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <CustomIcon name="bookmark-outline" size={80} color="#D1D5DB" type="material-community" />
          <Text style={styles.emptyTitle}>No Saved Questions</Text>
          <Text style={styles.emptyText}>
            {selectedSubject === 'all'
              ? 'Start practicing and bookmark questions to review them later!'
              : `No questions saved in ${selectedSubject}`}
          </Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  countBadge: {
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subjectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  removeButton: {
    padding: 4,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  topicText: {
    fontSize: 13,
    color: '#6B7280',
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  optionText: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  correctOptionText: {
    fontWeight: '600',
    color: '#059669',
  },
  explanationContainer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BookmarkedQuestionsScreen;

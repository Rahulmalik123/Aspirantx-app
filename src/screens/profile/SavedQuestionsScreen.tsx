import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface SavedQuestion {
  id: string;
  question: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  savedAt: string;
}

const SavedQuestionsScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [questions, setQuestions] = useState<SavedQuestion[]>([
    {
      id: '1',
      question: 'What is the capital of India?',
      subject: 'Geography',
      topic: 'Indian Geography',
      difficulty: 'Easy',
      savedAt: '2024-01-20',
    },
    {
      id: '2',
      question: 'Who wrote the book "Discovery of India"?',
      subject: 'History',
      topic: 'Modern India',
      difficulty: 'Medium',
      savedAt: '2024-01-19',
    },
    {
      id: '3',
      question: 'What is the chemical formula of water?',
      subject: 'Chemistry',
      topic: 'Basic Chemistry',
      difficulty: 'Easy',
      savedAt: '2024-01-18',
    },
  ]);

  const filters = ['All', 'Easy', 'Medium', 'Hard'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const handleRemoveBookmark = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const renderQuestion = ({ item }: { item: SavedQuestion }) => (
    <TouchableOpacity
      style={styles.questionCard}
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to question details
      }}
    >
      <View style={styles.questionHeader}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) + '20' }]}>
          <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
            {item.difficulty}
          </Text>
        </View>
      </View>
      
      <Text style={styles.questionText} numberOfLines={2}>
        {item.question}
      </Text>
      
      <View style={styles.questionFooter}>
        <View style={styles.topicContainer}>
          <Icon name="folder-outline" size={14} color="#6B7280" />
          <Text style={styles.topicText}>{item.topic}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRemoveBookmark(item.id)}
          style={styles.bookmarkButton}
        >
          <Icon name="bookmark" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Saved Questions"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search-outline" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        }
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === item && styles.filterTextActive,
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Questions List */}
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id}
        renderItem={renderQuestion}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bookmark-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Saved Questions</Text>
            <Text style={styles.emptyText}>
              Questions you bookmark will appear here
            </Text>
          </View>
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filtersList: {
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
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  subjectBadge: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    marginBottom: 12,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicText: {
    fontSize: 13,
    color: '#6B7280',
  },
  bookmarkButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default SavedQuestionsScreen;

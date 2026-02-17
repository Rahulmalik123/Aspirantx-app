import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import CustomIcon from '../../components/CustomIcon';
import { COLORS } from '../../constants/colors';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

interface DailyQuiz {
  _id: string;
  assignedDate: string;
  totalQuestions: number;
  status: 'pending' | 'in_progress' | 'completed';
  score: number;
  accuracy: number;
  subject?: {
    _id: string;
    name: string;
  };
  questionBank?: {
    _id: string;
    name: string;
  };
}

const DailyPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { examId } = route.params || {};
  
  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDailyQuizzes();
  }, []);

  const fetchDailyQuizzes = async () => {
    try {
      // Fetch only today's pending/in_progress quizzes
      const response = await practiceService.getTodayQuizzes();
      console.log('📚 Today\'s quizzes response:', response);
      console.log('📚 Quizzes array:', response.data?.quizzes);
      console.log('📚 Quizzes length:', response.data?.quizzes?.length);
      setQuizzes(response.data?.quizzes || []);
    } catch (error) {
      console.error('Failed to fetch today\'s quizzes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDailyQuizzes();
  };

  const handleStartQuiz = async (quiz: DailyQuiz) => {
    if (quiz.status === 'completed') {
      // Navigate to result screen
      navigation.navigate('QuizAttempt', {
        quizId: quiz._id,
        isReview: true,
      });
    } else {
      // Start or resume quiz
      navigation.navigate('QuizAttempt', {
        quizId: quiz._id,
        isReview: false,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'in_progress':
        return '#F59E0B';
      default:
        return '#0040a1';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Started';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderQuizCard = ({ item }: { item: DailyQuiz }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => handleStartQuiz(item)}
      activeOpacity={0.7}
    >
      <View style={styles.quizHeader}>
        <View style={styles.quizLeft}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <View>
            <Text style={styles.quizTitle}>
              {item.questionBank?.name || item.subject?.name || 'Daily Practice'}
            </Text>
            <Text style={styles.quizDate}>{formatDate(item.assignedDate)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.quizStats}>
        <View style={styles.statItem}>
          <CustomIcon name="help-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.statText}>{item.totalQuestions} Questions</Text>
        </View>
        {item.status === 'completed' && (
          <>
            <View style={styles.statItem}>
              <CustomIcon name="checkmark-circle-outline" size={16} color="#10B981" />
              <Text style={styles.statText}>{item.score} Score</Text>
            </View>
            <View style={styles.statItem}>
              <CustomIcon name="trending-up-outline" size={16} color="COLORS.primary" />
              <Text style={styles.statText}>{item.accuracy}% Accuracy</Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.quizFooter}>
        <Text style={styles.actionText}>
          {item.status === 'completed' ? 'View Results' : item.status === 'in_progress' ? 'Resume Quiz' : 'Start Quiz'}
        </Text>
        <CustomIcon name="chevron-forward" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Daily Practice" onBackPress={() => navigation.goBack()} />

      {quizzes.length === 0 ? (
        <View style={styles.centered}>
          <CustomIcon name="book-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Daily Practice Available</Text>
          <Text style={styles.emptyText}>
            Daily practice quizzes will be assigned automatically.{'\n'}
            Please check back later!
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={quizzes}
          renderItem={renderQuizCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  listContent: {
    padding: 20,
  },
  quizCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quizLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  quizDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  quizStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: '#6B7280',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default DailyPracticeScreen;

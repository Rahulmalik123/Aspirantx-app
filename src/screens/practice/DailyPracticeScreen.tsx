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
import { useNavigation } from '@react-navigation/native';
import CustomIcon from '../../components/CustomIcon';
import { COLORS } from '../../constants/colors';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

interface DailyQuiz {
  _id: string;
  date: string;
  totalQuestions: number;
  status: 'pending' | 'in_progress' | 'completed';
  score?: number;
  accuracy?: number;
  exam?: {
    _id: string;
    name: string;
    examCode: string;
  };
  subject?: {
    _id: string;
    name: string;
    icon?: string;
  };
  questionBank?: {
    _id: string;
    name: string;
    examNames?: string[];
    subjectName?: string;
    dailyQuestionCount?: number;
  };
}

const DailyPracticeScreen = () => {
  const navigation = useNavigation<any>();

  const [quizzes, setQuizzes] = useState<DailyQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDailyQuizzes();
  }, []);

  const fetchDailyQuizzes = async () => {
    try {
      const response = await practiceService.getTodayQuizzes();
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

  const handleStartQuiz = (quiz: DailyQuiz) => {
    if (quiz.status === 'completed') {
      navigation.navigate('QuizAttempt', {
        quizId: quiz._id,
        isReview: true,
      });
    } else {
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
        return COLORS.primary;
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

  const getActionText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'View Results';
      case 'in_progress':
        return 'Resume Quiz';
      default:
        return 'Start Quiz';
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
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const renderQuizCard = ({ item }: { item: DailyQuiz }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleStartQuiz(item)}
        activeOpacity={0.6}
      >
        {/* Top Row: Icon + Title + Status Badge */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: statusColor + '15' }]}>
            <Text style={styles.iconEmoji}>{item.subject?.icon || '📝'}</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.exam?.name || item.questionBank?.name || 'Daily Practice'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {item.subject?.name || item.questionBank?.subjectName}
              </Text>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{formatDate(item.date)}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <CustomIcon name="help-circle-outline" size={14} color="#9CA3AF" />
            <Text style={styles.statText}>{item.totalQuestions} Questions</Text>
          </View>
          {item.status === 'completed' && (
            <>
              <View style={styles.statItem}>
                <CustomIcon name="checkmark-circle-outline" size={14} color="#10B981" />
                <Text style={styles.statText}>{item.score} Score</Text>
              </View>
              <View style={styles.statItem}>
                <CustomIcon name="trending-up-outline" size={14} color={COLORS.primary} />
                <Text style={styles.statText}>{item.accuracy}% Accuracy</Text>
              </View>
            </>
          )}
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <Text style={[styles.actionText, { color: statusColor }]}>
            {getActionText(item.status)}
          </Text>
          <CustomIcon name="chevron-forward" size={16} color={statusColor} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Daily Practice" onBackPress={() => navigation.goBack()} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Daily Practice" onBackPress={() => navigation.goBack()} />

      {quizzes.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconBox}>
            <CustomIcon name="book-outline" size={36} color="#9CA3AF" />
          </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  listContent: {
    padding: 16,
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },

  // Action
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },

  // Empty
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default DailyPracticeScreen;

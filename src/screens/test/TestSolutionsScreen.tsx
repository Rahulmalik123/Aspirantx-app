import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';
import testService from '../../api/services/testService';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  subject?: string;
  topic?: string;
}

interface Answer {
  question: Question;
  selectedOption: number | null;
  isCorrect: boolean;
  timeTaken: number;
}

const TestSolutionsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { attemptId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'correct' | 'incorrect' | 'skipped'>('all');

  useEffect(() => {
    fetchReviewData();
  }, []);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      // Use getTestResult which calls GET /api/v1/tests/results/:attemptId
      const response = await testService.getTestResult(attemptId);
      console.log('📝 [TestSolutions] Test result data:', response);
      console.log('📝 [TestSolutions] Answers sample:', JSON.stringify(response?.answers?.[0], null, 2));
      
      const resultData = response.data || response;
      
      // Backend returns answers array with embedded question data
      // Structure: { answers: [{ questionId: {...question}, selectedOption: 1, isCorrect: true }] }
      const answersArray = resultData.answers || [];
      
      // Transform to match our expected format
      const transformedAnswers = answersArray.map((ans: any) => ({
        question: ans.questionId || ans.question || {},
        selectedOption: ans.selectedOption ?? ans.selectedAnswer ?? null,
        isCorrect: ans.isCorrect || false,
        timeTaken: ans.timeTaken || ans.timeSpent || 0,
      }));
      
      const transformedData = {
        answers: transformedAnswers,
      };
      
      console.log('📝 [TestSolutions] Original answers count:', answersArray.length);
      console.log('📝 [TestSolutions] Transformed answers count:', transformedAnswers.length);
      console.log('📝 [TestSolutions] First transformed answer:', JSON.stringify(transformedAnswers[0], null, 2));
      setReviewData(transformedData);
    } catch (error) {
      console.error('Error fetching review data:', error);
      Alert.alert('Error', 'Failed to load solutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAnswers = () => {
    if (!reviewData?.answers) return [];
    
    switch (selectedFilter) {
      case 'correct':
        return reviewData.answers.filter((a: Answer) => a.isCorrect);
      case 'incorrect':
        return reviewData.answers.filter((a: Answer) => !a.isCorrect && a.selectedOption !== null);
      case 'skipped':
        return reviewData.answers.filter((a: Answer) => a.selectedOption === null);
      default:
        return reviewData.answers;
    }
  };

  const getOptionStyle = (questionIndex: number, optionIndex: number, answer: Answer) => {
    const isSelected = answer.selectedOption === optionIndex;
    const isCorrect = answer.question.correctAnswer === optionIndex;

    if (isCorrect) {
      return [styles.option, styles.correctOption];
    }
    if (isSelected && !isCorrect) {
      return [styles.option, styles.wrongOption];
    }
    return styles.option;
  };

  const getOptionTextStyle = (questionIndex: number, optionIndex: number, answer: Answer) => {
    const isSelected = answer.selectedOption === optionIndex;
    const isCorrect = answer.question.correctAnswer === optionIndex;

    if (isCorrect) {
      return [styles.optionText, styles.correctOptionText];
    }
    if (isSelected && !isCorrect) {
      return [styles.optionText, styles.wrongOptionText];
    }
    return styles.optionText;
  };

  const getQuestionStatusIcon = (answer: Answer) => {
    if (answer.selectedOption === null) {
      return { name: 'remove-circle', color: '#9CA3AF' };
    }
    if (answer.isCorrect) {
      return { name: 'checkmark-circle', color: '#10B981' };
    }
    return { name: 'close-circle', color: '#EF4444' };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          title="Solutions & Answers" 
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading solutions...</Text>
        </View>
      </View>
    );
  }

  const filteredAnswers = getFilteredAnswers();

  return (
    <View style={styles.container}>
      <Header 
        title="Solutions & Answers" 
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'all' && styles.filterTabTextActive]}>
              All ({reviewData?.answers?.length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'correct' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('correct')}
          >
            <CustomIcon name="checkmark-circle" size={16} color={selectedFilter === 'correct' ? COLORS.white : '#10B981'} />
            <Text style={[styles.filterTabText, selectedFilter === 'correct' && styles.filterTabTextActive]}>
              Correct ({reviewData?.answers?.filter((a: Answer) => a.isCorrect).length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'incorrect' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('incorrect')}
          >
            <CustomIcon name="close-circle" size={16} color={selectedFilter === 'incorrect' ? COLORS.white : '#EF4444'} />
            <Text style={[styles.filterTabText, selectedFilter === 'incorrect' && styles.filterTabTextActive]}>
              Incorrect ({reviewData?.answers?.filter((a: Answer) => !a.isCorrect && a.selectedOption !== null).length || 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'skipped' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('skipped')}
          >
            <CustomIcon name="remove-circle" size={16} color={selectedFilter === 'skipped' ? COLORS.white : '#9CA3AF'} />
            <Text style={[styles.filterTabText, selectedFilter === 'skipped' && styles.filterTabTextActive]}>
              Skipped ({reviewData?.answers?.filter((a: Answer) => a.selectedOption === null).length || 0})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {filteredAnswers.length === 0 ? (
            <View style={styles.emptyState}>
              <CustomIcon name="document-text-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No questions found</Text>
            </View>
          ) : (
            filteredAnswers.map((answer: Answer, index: number) => {
              const statusIcon = getQuestionStatusIcon(answer);
              const originalIndex = reviewData.answers.indexOf(answer);

              return (
                <View key={answer.question._id} style={styles.questionCard}>
                  {/* Question Header */}
                  <View style={styles.questionHeader}>
                    <View style={styles.questionNumberContainer}>
                      <Text style={styles.questionNumber}>Q{originalIndex + 1}</Text>
                      <CustomIcon name={statusIcon.name} size={20} color={statusIcon.color} />
                    </View>
                    {(answer.question.subjectName || answer.question.subject) && (
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectBadgeText}>
                          {answer.question.subjectName || answer.question.subject}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Question Text */}
                  <Text style={styles.questionText}>{answer.question.questionText}</Text>

                  {/* Options */}
                  <View style={styles.optionsContainer}>
                    {answer.question.options.map((option: any, optionIndex: number) => {
                      // Handle both string and object formats for options
                      const optionText = typeof option === 'string' ? option : option.text;
                      
                      return (
                        <View
                          key={optionIndex}
                          style={getOptionStyle(originalIndex, optionIndex, answer)}
                        >
                          <View style={styles.optionContent}>
                            <Text style={styles.optionLabel}>{String.fromCharCode(65 + optionIndex)}.</Text>
                            <Text style={getOptionTextStyle(originalIndex, optionIndex, answer)}>
                              {optionText}
                            </Text>
                          </View>
                          {answer.question.correctAnswer === optionIndex && (
                            <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
                          )}
                          {answer.selectedOption === optionIndex && answer.selectedOption !== answer.question.correctAnswer && (
                            <CustomIcon name="close-circle" size={20} color="#EF4444" />
                          )}
                        </View>
                      );
                    })}
                  </View>

                  {/* Answer Status */}
                  <View style={styles.answerStatusContainer}>
                    {answer.selectedOption === null ? (
                      <View style={styles.statusBadge}>
                        <CustomIcon name="remove-circle" size={16} color="#9CA3AF" />
                        <Text style={styles.skippedText}>Not Attempted</Text>
                      </View>
                    ) : answer.isCorrect ? (
                      <View style={styles.statusBadge}>
                        <CustomIcon name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.correctText}>Correct Answer!</Text>
                      </View>
                    ) : (
                      <View style={styles.statusColumn}>
                        <View style={styles.statusBadge}>
                          <CustomIcon name="close-circle" size={16} color="#EF4444" />
                          <Text style={styles.incorrectText}>Incorrect</Text>
                        </View>
                        <Text style={styles.correctAnswerLabel}>
                          Correct Answer: {String.fromCharCode(65 + answer.question.correctAnswer)}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Explanation */}
                  {answer.question.explanation && (
                    <View style={styles.explanationContainer}>
                      <View style={styles.explanationHeader}>
                        <CustomIcon name="bulb" size={16} color="#F59E0B" />
                        <Text style={styles.explanationTitle}>Explanation</Text>
                      </View>
                      <Text style={styles.explanationText}>
                        {typeof answer.question.explanation === 'string' 
                          ? answer.question.explanation 
                          : answer.question.explanation.text || ''}
                      </Text>
                    </View>
                  )}

                  {/* Additional Info */}
                  {(answer.question.topicName || answer.question.topic) && (
                    <View style={styles.additionalInfo}>
                      <CustomIcon name="bookmark-outline" size={14} color="#6B7280" />
                      <Text style={styles.additionalInfoText}>
                        Topic: {answer.question.topicName || answer.question.topic}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  subjectBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#111827',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  correctOption: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  wrongOption: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    minWidth: 24,
  },
  optionText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  correctOptionText: {
    color: '#065F46',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#991B1B',
    fontWeight: '600',
  },
  answerStatusContainer: {
    marginBottom: 12,
  },
  statusColumn: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  correctText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  incorrectText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  skippedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  explanationContainer: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350F',
  },
  additionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  additionalInfoText: {
    fontSize: 13,
    color: '#6B7280',
  },
});

export default TestSolutionsScreen;

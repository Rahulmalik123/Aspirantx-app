import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomIcon from '../../components/CustomIcon';
import { COLORS } from '../../constants/colors';
import apiClient from '../../api/client';
import { Question } from '../../types/question.types';
import Header from '../../components/common/Header';

const QuizAttemptScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { quizId, isReview } = route.params;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [quizData, setQuizData] = useState<any>(null);
  const [startTime] = useState<number>(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (!isReview && questions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isReview, questions.length]);

  const fetchQuizData = async () => {
    try {
      const response = await apiClient.get(`/api/v1/quiz-banks/daily/${quizId}`);
      const quizResponse = response.data?.quiz || response.data;
      const attemptResponse = response.data?.attempt;
      
      console.log('📝 Quiz data:', quizResponse);
      console.log('📝 Attempt data:', attemptResponse);
      console.log('📝 Questions:', quizResponse.questions);
      
      setQuizData(quizResponse);
      setQuestions(quizResponse.questions || []);
      
      if (isReview || attemptResponse?.status === 'completed') {
        // Load previous answers
        const answers: Record<string, number> = {};
        attemptResponse?.userAnswers?.forEach((ans: any) => {
          answers[ans.questionId] = ans.selectedAnswer;
        });
        setSelectedAnswers(answers);
      }
    } catch (error) {
      console.error('Failed to fetch quiz:', error);
      Alert.alert('Error', 'Failed to load quiz. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isReview) return; // Don't allow changes in review mode
    
    // Track time spent on this question
    const currentQuestionId = questions[currentIndex]._id;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setQuestionTimes({
      ...questionTimes,
      [currentQuestionId]: timeSpent,
    });
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionId]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // Save time for current question before moving to next
      const currentQuestionId = questions[currentIndex]._id;
      if (!questionTimes[currentQuestionId]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        setQuestionTimes({
          ...questionTimes,
          [currentQuestionId]: timeSpent,
        });
      }
      
      setCurrentIndex(currentIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      // Save time for current question before moving to previous
      const currentQuestionId = questions[currentIndex]._id;
      if (!questionTimes[currentQuestionId]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        setQuestionTimes({
          ...questionTimes,
          [currentQuestionId]: timeSpent,
        });
      }
      
      setCurrentIndex(currentIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    try {
      // Save time for current question
      const currentQuestionId = questions[currentIndex]._id;
      const finalQuestionTimes = { ...questionTimes };
      if (!finalQuestionTimes[currentQuestionId]) {
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        finalQuestionTimes[currentQuestionId] = timeSpent;
      }
      
      // Calculate total time taken
      const totalTimeTaken = Math.floor((Date.now() - startTime) / 1000);
      
      const userAnswers = Object.entries(selectedAnswers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
        timeTaken: finalQuestionTimes[questionId] || 0,
      }));

      const response = await apiClient.post(`/api/v1/quiz-banks/daily/${quizId}/complete`, {
        userAnswers,
        totalTimeTaken,
      });

      navigation.replace('PracticeResult', {
        quizId,
        result: response,
      });
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <CustomIcon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.emptyTitle}>No Questions Found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedOption = selectedAnswers[currentQuestion._id];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <View style={styles.container}>
      <Header 
        title={`Question ${currentIndex + 1}/${questions.length}`}
        subtitle={!isReview ? `⏱ ${formatTime(timeLeft)}` : undefined}
        onBackPress={() => navigation.goBack()}
        showBackButton={true}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
          {currentQuestion.questionImage && (
            <Text style={styles.imageNote}>📷 Image attached</Text>
          )}
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = isReview && option.isCorrect;
            const isWrong = isReview && isSelected && !option.isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  isCorrect && isReview && styles.correctOption,
                  isWrong && styles.wrongOption,
                ]}
                onPress={() => handleSelectOption(index)}
                disabled={isReview}
              >
                <View style={[
                  styles.optionIndicator,
                  isSelected && styles.selectedIndicator,
                  isCorrect && isReview && styles.correctIndicator,
                  isWrong && styles.wrongIndicator,
                ]}>
                  <Text style={[
                    styles.optionKey,
                    (isSelected || isCorrect) && styles.selectedKey,
                  ]}>
                    {optionLabels[index]}
                  </Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedText,
                ]}>
                  {option.text}
                </Text>
                {isCorrect && isReview && (
                  <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
                )}
                {isWrong && (
                  <CustomIcon name="close-circle" size={20} color="#EF4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation in Review Mode */}
        {isReview && currentQuestion.explanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <CustomIcon name="bulb-outline" size={20} color="#F59E0B" />
              <Text style={styles.explanationTitle}>Explanation</Text>
            </View>
            <Text style={styles.explanationText}>
              {typeof currentQuestion.explanation === 'string' 
                ? currentQuestion.explanation 
                : currentQuestion.explanation.text}
            </Text>
          </View>
        )}

        {/* Show correct answer in review mode */}
        {isReview && selectedOption !== undefined && (
          <View style={styles.correctAnswerCard}>
            <Text style={styles.correctAnswerLabel}>
              {currentQuestion.options[selectedOption]?.isCorrect 
                ? '✓ Your answer is correct!' 
                : `✗ Correct answer: Option ${currentQuestion.options.findIndex((opt: any) => opt.isCorrect) + 1}`}
            </Text>
            {currentQuestion.options[selectedOption] && !currentQuestion.options[selectedOption].isCorrect && (
              <View style={styles.correctOptionHighlight}>
                <Text style={styles.correctOptionText}>
                  {currentQuestion.options.find((opt: any) => opt.isCorrect)?.text}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <CustomIcon name="chevron-back" size={20} color="#111827" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        {!isReview && currentIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Quiz</Text>
            <CustomIcon name="checkmark" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, currentIndex === questions.length - 1 && styles.disabledButton]}
            onPress={handleNext}
            disabled={currentIndex === questions.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <CustomIcon name="chevron-forward" size={20} color="#111827" />
          </TouchableOpacity>
        )}
      </View>
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
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  headerCenter: {
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  placeholder: {
    width: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    fontWeight: '500',
  },
  imageNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  wrongOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedIndicator: {
    backgroundColor: COLORS.primary,
  },
  correctIndicator: {
    backgroundColor: '#10B981',
  },
  wrongIndicator: {
    backgroundColor: '#EF4444',
  },
  optionKey: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedKey: {
    color: '#FFF',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  selectedText: {
    fontWeight: '500',
  },
  explanationCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  explanationText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  correctAnswerCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 8,
  },
  correctOptionHighlight: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  correctOptionText: {
    fontSize: 14,
    color: '#065F46',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
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
});

export default QuizAttemptScreen;

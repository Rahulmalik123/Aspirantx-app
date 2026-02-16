import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import testService from '../../api/services/testService';
import Header from '../../components/common/Header';

const TestAttemptScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { testId, attemptId, questions, duration } = route.params || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(duration ? duration * 60 : 5400); // Convert minutes to seconds
  const timerRef = useRef<any>(null);
  const submittingRef = useRef(false);
  const selectedAnswersRef = useRef<{ [key: number]: number }>({});
  const questionsRef = useRef(questions);

  // Keep refs in sync with state
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  const submitTest = useCallback(async () => {
    if (submittingRef.current) {
      console.log('⚠️ [TestAttempt] Already submitting, skipping...');
      return;
    }
    
    submittingRef.current = true;
    
    try {
      // Use the ref to get the latest answers and questions
      const currentAnswers = selectedAnswersRef.current;
      const currentQuestions = questionsRef.current;
      const answers = currentQuestions.map((q: any, index: number) => {
        const hasAnswer = currentAnswers[index] !== undefined;
        return {
          questionId: q._id,
          selectedOption: hasAnswer ? currentAnswers[index] : null,
          timeSpent: 60, // You can track actual time per question
          skipped: !hasAnswer,
        };
      });

      console.log('📤 [TestAttempt] Submitting answers:', JSON.stringify(answers, null, 2));
      console.log('📤 [TestAttempt] Selected answers state:', currentAnswers);

      // Use attemptId for submission
      const response = await testService.submitTest(attemptId, answers);
      
      console.log('✅ [TestAttempt] Submit response:', response);
      
      // Transform the response to match TestResultScreen's expected format
      const resultData = response.data || response;
      
      // Calculate values from the answers array if backend doesn't provide them
      const answersArray = resultData.answers || [];
      const correctCount = answersArray.filter((a: any) => a.isCorrect).length;
      const wrongCount = answersArray.filter((a: any) => !a.isCorrect && !a.skipped).length;
      const skippedCount = answersArray.filter((a: any) => a.skipped).length;
      const attemptedCount = answersArray.length - skippedCount;
      const totalMarks = resultData.totalMarks || 0;
      const marksObtained = answersArray.reduce((sum: number, a: any) => sum + (a.marksAwarded || 0), 0);
      const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;
      const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
      
      const transformedResult = {
        summary: {
          totalQuestions: resultData.totalQuestions || answersArray.length,
          attempted: attemptedCount,
          correct: correctCount,
          incorrect: wrongCount,
          skipped: skippedCount,
          totalMarks: totalMarks,
          marksObtained: marksObtained,
          percentage: percentage,
          accuracy: accuracy,
          timeTaken: resultData.timeSpent || 0,
        },
        rank: {
          yourRank: resultData.rank || 0,
          totalParticipants: 0,
          percentile: 0,
        },
        answers: answersArray,
      };
      
      console.log('📊 [TestAttempt] Transformed result:', transformedResult);
      
      navigation.replace('TestResult', {
        testId,
        attemptId,
        result: transformedResult,
        shouldRefreshTestList: true, // Flag to refresh test list
      });
    } catch (error) {
      console.error('❌ [TestAttempt] Error submitting test:', error);
      submittingRef.current = false;
      Alert.alert('Error', 'Failed to submit test. Please try again.');
    }
  }, [attemptId, navigation, testId]);

  // Timer effect - runs only once on mount
  useEffect(() => {
    console.log('📝 [TestAttempt] Component mounted');
    console.log('📝 [TestAttempt] Test ID:', testId);
    console.log('📝 [TestAttempt] Attempt ID:', attemptId);
    console.log('📝 [TestAttempt] Duration:', duration);
    console.log('📝 [TestAttempt] Questions count:', questions?.length);
    
    if (!questions || questions.length === 0) {
      Alert.alert('Error', 'No questions available for this test', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    
    // Start timer only once
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          if (timerRef.current) clearInterval(timerRef.current);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    timerRef.current = timer;
    
    return () => {
      console.log('📝 [TestAttempt] Component unmounting, clearing timer');
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = useCallback((optionIndex: number) => {
    console.log(`✅ [TestAttempt] Selected option ${optionIndex} for question ${currentIndex}`);
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  }, [currentIndex]);

  const handleMarkForReview = useCallback(() => {
    setMarkedForReview(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(currentIndex)) {
        newMarked.delete(currentIndex);
      } else {
        newMarked.add(currentIndex);
      }
      return newMarked;
    });
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleSubmit = useCallback(() => {
    Alert.alert(
      'Submit Test',
      'Are you sure you want to submit the test? You cannot change answers after submission.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: submitTest },
      ]
    );
  }, [submitTest]);

  const currentQuestion = questions?.[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = (questions?.length || 0) - answeredCount;

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Test Attempt"  />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No questions available</Text>
        </View>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Header title="Test Attempt"  />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading question...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.questionNumber}>Q {currentIndex + 1}/{questions.length}</Text>
        </View>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>⏱ {formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentQuestion?.options?.map((option: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[currentIndex] === index && styles.optionButtonSelected,
              ]}
              onPress={() => handleSelectOption(index)}
            >
              <View style={[
                styles.optionCircle,
                selectedAnswers[currentIndex] === index && styles.optionCircleSelected,
              ]}>
                {selectedAnswers[currentIndex] === index && (
                  <View style={styles.optionDot} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswers[currentIndex] === index && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.statusText}>{answeredCount} Answered</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.statusText}>{markedForReview.size} Marked</Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: '#E5E7EB' }]} />
            <Text style={styles.statusText}>{unansweredCount} Not Visited</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.markButton}
            onPress={handleMarkForReview}
          >
            <Text style={styles.markButtonText}>
              {markedForReview.has(currentIndex) ? 'Unmark' : 'Mark'}
            </Text>
          </TouchableOpacity>

          {currentIndex < questions.length - 1 ? (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  timerBox: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    borderColor: COLORS.primary,
  },
  optionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  markButton: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  markButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default TestAttemptScreen;

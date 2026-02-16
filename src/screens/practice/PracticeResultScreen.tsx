import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const PracticeResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  // Handle both old format (questions, selectedAnswers) and new format (result)
  const { 
    questions = [], 
    selectedAnswers = {}, 
    timeTaken = 0,
    result,
    quizId,
  } = route.params || {};

  // If result is from daily quiz submission - the response has data.attempt structure
  const resultData = result?.data?.attempt || result?.attempt || result?.data?.quiz || result?.quiz;
  
  console.log('🎯 [PracticeResult] Full result:', JSON.stringify(result, null, 2));
  console.log('🎯 [PracticeResult] Result data:', resultData);
  
  const correctCount = resultData?.correctAnswers || questions.filter(
    (q: any) => selectedAnswers[q._id] === q.correctAnswer
  ).length;
  
  const incorrectCount = resultData?.incorrectAnswers || (questions.length - correctCount);
  const skippedCount = resultData?.skippedQuestions || 0;
  const totalQuestions = resultData?.totalQuestions || questions.length;
  const accuracy = resultData?.accuracy || (totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0);
  const score = resultData?.score || accuracy;
  const totalTime = resultData?.totalTimeTaken || timeTaken;
  const coinsEarned = resultData?.coinsEarned || 0;
  
  console.log('📊 [PracticeResult] Stats:', {
    correctCount,
    incorrectCount,
    skippedCount,
    totalQuestions,
    accuracy,
    score,
    totalTime,
    coinsEarned
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Header title="Results" showBackButton={false} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{score}%</Text>
              <Text style={styles.scoreLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{correctCount}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>
                {incorrectCount}
              </Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            {skippedCount > 0 && (
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#6B7280' }]}>
                  {skippedCount}
                </Text>
                <Text style={styles.statLabel}>Skipped</Text>
              </View>
            )}
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatTime(totalTime)}</Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            {coinsEarned > 0 && (
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {coinsEarned}
                </Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
            )}
          </View>

          {questions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Answer Review</Text>
            {questions.map((question: any, index: number) => {
              const isCorrect = selectedAnswers[question._id] === question.correctAnswer;
              return (
                <View key={question._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.questionNumber}>Q{index + 1}</Text>
                    <View style={[
                      styles.resultBadge,
                      isCorrect ? styles.correctBadge : styles.wrongBadge
                    ]}>
                      <Text style={[
                        styles.resultText,
                        isCorrect ? styles.correctText : styles.wrongText
                      ]}>
                        {isCorrect ? '✓ Correct' : '✗ Wrong'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reviewQuestion}>{question.question}</Text>
                  <View style={styles.answerRow}>
                    <Text style={styles.answerLabel}>Your Answer:</Text>
                    <Text style={[styles.answerValue, !isCorrect && { color: '#EF4444' }]}>
                      {selectedAnswers[question._id] || 'Not answered'}
                    </Text>
                  </View>
                  {!isCorrect && (
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>Correct Answer:</Text>
                      <Text style={[styles.answerValue, { color: '#10B981' }]}>
                        {question.correctAnswer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {quizId && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.secondary, marginBottom: 10 }]}
            onPress={() => navigation.navigate('QuizAttempt', { quizId, isReview: true })}
          >
            <Text style={styles.buttonText}>Review Answers</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  correctBadge: {
    backgroundColor: '#D1FAE5',
  },
  wrongBadge: {
    backgroundColor: '#FEE2E2',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  correctText: {
    color: '#065F46',
  },
  wrongText: {
    color: '#991B1B',
  },
  reviewQuestion: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  answerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  answerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default PracticeResultScreen;

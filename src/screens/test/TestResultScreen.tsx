import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import testService from '../../api/services/testService';
import Header from '../../components/common/Header';

const TestResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { result, attemptId, testId, shouldRefreshTestList } = route.params || {};

  const [resultData, setResultData] = useState<any>(result?.data || result);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    // If result data is not passed, fetch it using attemptId
    if (!result && attemptId) {
      fetchResultData();
    }
  }, [attemptId]);

  const fetchResultData = async () => {
    try {
      setLoading(true);
      const response = await testService.getTestResult(attemptId);
      console.log('📊 [TestResult] Fetched result:', response);
      setResultData(response.data || response);
    } catch (error) {
      console.error('❌ [TestResult] Error fetching result:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Extract values based on API response structure
  const {
    totalQuestions = resultData?.totalQuestions || 0,
    attemptedQuestions = resultData?.attemptedQuestions || 0,
    correctAnswers = resultData?.correctAnswers || 0,
    wrongAnswers = resultData?.wrongAnswers || 0,
    skippedQuestions = resultData?.skippedQuestions || 0,
    totalMarks = resultData?.totalMarks || 100,
    marksObtained = resultData?.marksObtained || 0,
    percentage = resultData?.percentage || 0,
    accuracy = resultData?.accuracy || 0,
    timeSpent = resultData?.timeSpent || 0,
    rank = resultData?.rank || 0,
  } = resultData || {};

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const getPerformanceMessage = () => {
    if (percentage >= 80) return { text: '🎉 Excellent!', color: '#10B981' };
    if (percentage >= 60) return { text: '👍 Good Job!', color: '#3B82F6' };
    if (percentage >= 40) return { text: '😊 Keep Practicing', color: '#F59E0B' };
    return { text: '💪 Don\'t Give Up', color: '#EF4444' };
  };

  const performance = getPerformanceMessage();

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Test Result" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Test Result" 
        onBackPress={() => {
          // Navigate back and ensure test list gets refreshed
          if (shouldRefreshTestList) {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          } else {
            navigation.navigate('MainTabs');
          }
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.performanceCard}>
            <Text style={[styles.performanceText, { color: performance.color }]}>
              {performance.text}
            </Text>
            <View style={styles.scoreCircle}>
              <Text style={styles.scorePercentage}>{percentage.toFixed(1)}%</Text>
              <Text style={styles.scoreSubtext}>Score</Text>
            </View>
            <Text style={styles.scoreText}>
              {marksObtained.toFixed(1)} / {totalMarks} Marks
            </Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{correctAnswers}</Text>
              <Text style={styles.statLabel}>Correct</Text>
              <View style={[styles.statBadge, { backgroundColor: '#D1FAE5' }]}>
                <Text style={[styles.statBadgeText, { color: '#065F46' }]}>✓</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{wrongAnswers}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
              <View style={[styles.statBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.statBadgeText, { color: '#991B1B' }]}>✗</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{skippedQuestions}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
              <View style={[styles.statBadge, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.statBadgeText, { color: '#1F2937' }]}>−</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📝 Attempted</Text>
              <Text style={styles.infoValue}>{attemptedQuestions} / {totalQuestions}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎯 Accuracy</Text>
              <Text style={styles.infoValue}>{accuracy.toFixed(1)}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>⏱ Time Taken</Text>
              <Text style={styles.infoValue}>{formatTime(timeSpent)}</Text>
            </View>
            {rank > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏆 Your Rank</Text>
                <Text style={styles.infoValue}>#{rank}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.solutionsButton}
            onPress={() => navigation.navigate('TestSolutions', { attemptId })}
          >
            <Text style={styles.solutionsButtonText}>View Answers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.leaderboardButton}
            onPress={() => navigation.navigate('TestLeaderboard', { testId: resultData?.attemptId })}
          >
            <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => {
              // Navigate back and refresh test list
              if (shouldRefreshTestList) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              } else {
                navigation.navigate('MainTabs');
              }
            }}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  closeIcon: {
    fontSize: 40,
    color: '#111827',
    fontWeight: '300',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  performanceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 8,
    borderColor: COLORS.primary,
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
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
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  statBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBadgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  solutionsButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  solutionsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  leaderboardButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  leaderboardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  homeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
});

export default TestResultScreen;

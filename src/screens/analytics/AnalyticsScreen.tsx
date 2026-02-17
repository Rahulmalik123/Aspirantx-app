import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  overall: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    averageTime: number;
    strongSubjects: string[];
    weakSubjects: string[];
  };
  bySubject: Array<{
    subject: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  byDifficulty: {
    easy: { attempted: number; correct: number; accuracy: number };
    medium: { attempted: number; correct: number; accuracy: number };
    hard: { attempted: number; correct: number; accuracy: number };
  };
  recentActivity: Array<{
    date: string;
    questionsAttempted: number;
    accuracy: number;
  }>;
}

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'subjects' | 'difficulty'>('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(ENDPOINTS.ANALYTICS_PERFORMANCE);
      console.log('📊 Analytics response:', response);
      
      // Handle response structure: { success, data: {...} }
      const analyticsData = response?.data || response;
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('❌ Failed to fetch analytics:', error.response?.data?.message || error.message);
      // Set empty data structure on error
      setAnalytics({
        overall: {
          totalQuestions: 0,
          correctAnswers: 0,
          accuracy: 0,
          averageTime: 0,
          strongSubjects: [],
          weakSubjects: []
        },
        bySubject: [],
        byDifficulty: {
          easy: { attempted: 0, correct: 0, accuracy: 0 },
          medium: { attempted: 0, correct: 0, accuracy: 0 },
          hard: { attempted: 0, correct: 0, accuracy: 0 }
        },
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (icon: string, label: string, value: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <CustomIcon name={icon} size={28} color={color} type="material-community" />
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  const renderProgressBar = (percentage: number, color: string) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );

  const renderOverview = () => {
    if (!analytics) return null;

    return (
      <View style={styles.tabContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {renderStatCard('head-question', 'Total Questions', analytics.overall.totalQuestions.toString(), 'COLORS.primary')}
          {renderStatCard('check-circle', 'Correct Answers', analytics.overall.correctAnswers.toString(), '#10B981')}
          {renderStatCard('percent', 'Accuracy', `${analytics.overall.accuracy.toFixed(1)}%`, '#F59E0B')}
          {renderStatCard('clock-fast', 'Avg Time', `${analytics.overall.averageTime}s`, '#8B5CF6')}
        </View>

        {/* Strong Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <CustomIcon name="trophy" size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Strong Areas</Text>
          </View>
          <View style={styles.chipContainer}>
            {analytics.overall.strongSubjects.length > 0 ? (
              analytics.overall.strongSubjects.map((subject, index) => (
                <View key={index} style={[styles.chip, styles.strongChip]}>
                  <Text style={styles.chipText}>{subject}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Keep practicing to identify strong areas</Text>
            )}
          </View>
        </View>

        {/* Weak Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <CustomIcon name="alert-circle" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Needs Improvement</Text>
          </View>
          <View style={styles.chipContainer}>
            {analytics.overall.weakSubjects.length > 0 ? (
              analytics.overall.weakSubjects.map((subject, index) => (
                <View key={index} style={[styles.chip, styles.weakChip]}>
                  <Text style={styles.chipText}>{subject}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No weak areas found - Great job! 🎉</Text>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Recent Activity (Last 7 Days)</Text>
          {analytics.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityLeft}>
                  <CustomIcon name="calendar" size={20} color="COLORS.primary" type="material-community" />
                  <Text style={styles.activityDate}>{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                </View>
                <View style={styles.activityRight}>
                  <Text style={styles.activityQuestions}>{activity.questionsAttempted} Qs</Text>
                  <Text style={[styles.activityAccuracy, { color: activity.accuracy >= 70 ? '#10B981' : '#EF4444' }]}>
                    {activity.accuracy.toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity found</Text>
          )}
        </View>
      </View>
    );
  };

  const renderSubjects = () => {
    if (!analytics) return null;

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
        {analytics.bySubject && analytics.bySubject.length > 0 ? (
          analytics.bySubject.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{subject.subject}</Text>
                <Text style={styles.subjectAccuracy}>{subject.accuracy.toFixed(1)}%</Text>
              </View>
              {renderProgressBar(subject.accuracy, subject.accuracy >= 70 ? '#10B981' : subject.accuracy >= 50 ? '#F59E0B' : '#EF4444')}
              <View style={styles.subjectStats}>
                <Text style={styles.subjectStatText}>Attempted: {subject.attempted}</Text>
                <Text style={styles.subjectStatText}>Correct: {subject.correct}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyTabState}>
            <CustomIcon name="book-open-variant" size={48} color="#D1D5DB" type="material-community" />
            <Text style={styles.emptyTabText}>No subject data available yet</Text>
          </View>
        )}
      </View>
    );
  };

  const renderDifficulty = () => {
    if (!analytics) return null;

    const difficulties = [
      { key: 'easy', label: 'Easy', color: '#10B981', icon: 'emoticon-happy' },
      { key: 'medium', label: 'Medium', color: '#F59E0B', icon: 'emoticon-neutral' },
      { key: 'hard', label: 'Hard', color: '#EF4444', icon: 'emoticon-sad' },
    ];

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Difficulty-wise Performance</Text>
        {difficulties.map((diff) => {
          const data = analytics.byDifficulty[diff.key as keyof typeof analytics.byDifficulty];
          return (
            <View key={diff.key} style={styles.difficultyCard}>
              <View style={styles.difficultyHeader}>
                <View style={styles.difficultyLeft}>
                  <CustomIcon name={diff.icon} size={28} color={diff.color} type="material-community" />
                  <Text style={styles.difficultyLabel}>{diff.label}</Text>
                </View>
                <Text style={[styles.difficultyAccuracy, { color: diff.color }]}>
                  {data.accuracy.toFixed(1)}%
                </Text>
              </View>
              {renderProgressBar(data.accuracy, diff.color)}
              <View style={styles.difficultyStats}>
                <View style={styles.difficultyStatItem}>
                  <Text style={styles.difficultyStatLabel}>Attempted</Text>
                  <Text style={styles.difficultyStatValue}>{data.attempted}</Text>
                </View>
                <View style={styles.difficultyStatItem}>
                  <Text style={styles.difficultyStatLabel}>Correct</Text>
                  <Text style={styles.difficultyStatValue}>{data.correct}</Text>
                </View>
                <View style={styles.difficultyStatItem}>
                  <Text style={styles.difficultyStatLabel}>Wrong</Text>
                  <Text style={styles.difficultyStatValue}>{data.attempted - data.correct}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="COLORS.primary" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  // Empty state when no data
  if (analytics && analytics.overall.totalQuestions === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <CustomIcon name="arrow-left" size={24} color="#1F2937" type="material-community" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Performance Analytics</Text>
          <TouchableOpacity onPress={fetchAnalytics}>
            <CustomIcon name="refresh" size={24} color="COLORS.primary" type="material-community" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyStateContainer}>
          <CustomIcon name="chart-bar" size={80} color="#D1D5DB" type="material-community" />
          <Text style={styles.emptyStateTitle}>No Analytics Data Yet</Text>
          <Text style={styles.emptyStateText}>
            Start practicing and taking tests to see your performance analytics here!
          </Text>
          <TouchableOpacity 
            style={styles.startPracticingButton}
            onPress={() => navigation.navigate('Practice' as never)}
          >
            <Text style={styles.startPracticingButtonText}>Start Practicing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <CustomIcon name="arrow-left" size={24} color="#1F2937" type="material-community" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Performance Analytics</Text>
        <TouchableOpacity onPress={fetchAnalytics}>
          <CustomIcon name="refresh" size={24} color="COLORS.primary" type="material-community" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'subjects' && styles.activeTab]}
          onPress={() => setSelectedTab('subjects')}
        >
          <Text style={[styles.tabText, selectedTab === 'subjects' && styles.activeTabText]}>Subjects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'difficulty' && styles.activeTab]}
          onPress={() => setSelectedTab('difficulty')}
        >
          <Text style={[styles.tabText, selectedTab === 'difficulty' && styles.activeTabText]}>Difficulty</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'subjects' && renderSubjects()}
        {selectedTab === 'difficulty' && renderDifficulty()}
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'COLORS.primary',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'COLORS.primary',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statInfo: {
    marginLeft: 16,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  strongChip: {
    backgroundColor: '#D1FAE5',
  },
  weakChip: {
    backgroundColor: '#FEE2E2',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityQuestions: {
    fontSize: 14,
    color: '#6B7280',
  },
  activityAccuracy: {
    fontSize: 14,
    fontWeight: '700',
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  subjectAccuracy: {
    fontSize: 16,
    fontWeight: '700',
    color: 'COLORS.primary',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  subjectStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subjectStatText: {
    fontSize: 13,
    color: '#6B7280',
  },
  difficultyCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  difficultyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  difficultyAccuracy: {
    fontSize: 18,
    fontWeight: '700',
  },
  difficultyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  difficultyStatItem: {
    alignItems: 'center',
  },
  difficultyStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  difficultyStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  startPracticingButton: {
    backgroundColor: 'COLORS.primary',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  startPracticingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyTabState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTabText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});

export default AnalyticsScreen;

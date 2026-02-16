import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import practiceService from '../../api/services/practiceService';
import userService from '../../api/services/userService';
import { showInfoToast } from '../../utils/toast';
import Header from '../../components/common/Header';

const { width } = Dimensions.get('window');

interface WeakConcept {
  conceptId: string;
  conceptName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

interface PracticeStats {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  streak: number;
  dailyGoal: number;
  dailyProgress: number;
}

const PracticeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);
  const [stats, setStats] = useState<PracticeStats>({
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    streak: 0,
    dailyGoal: 50,
    dailyProgress: 0,
  });

  const fetchData = async () => {
    try {
      const [weakConceptsData, userStats] = await Promise.all([
        practiceService.getWeakConcepts().catch(() => []),
        userService.getStats().catch(() => null),
      ]);

      // Handle both array and object responses
      const weakConceptsArray = Array.isArray(weakConceptsData) 
        ? weakConceptsData 
        : (weakConceptsData?.data || []);
      setWeakConcepts(weakConceptsArray.slice(0, 5));
      
      if (userStats?.stats) {
        setStats({
          totalQuestions: userStats.stats.totalQuestions || 0,
          totalCorrect: userStats.stats.correctQuestions || 0,
          accuracy: userStats.stats.accuracy || 0,
          streak: userStats.stats.streak || 0,
          dailyGoal: 50,
          dailyProgress: userStats.stats.dailyProgress || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch practice data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const practiceModes = [
    {
      id: 'daily',
      title: 'Daily Practice',
      icon: 'calendar',
      description: 'Daily Quiz',
      route: 'DailyPractice',
    },
    {
      id: 'subject',
      title: 'Subject-wise Tests',
      icon: 'library',
      description: 'Practice by subject',
      route: 'SubjectList',
    },
    {
      id: 'topic',
      title: 'Topic Practice',
      icon: 'bulb-outline',
      description: 'By topic',
      route: 'TopicPractice',
    },
    // PYQ Practice - Temporarily Commented Out
    // {
    //   id: 'pyq',
    //   title: 'Previous Years',
    //   icon: 'document-text',
    //   description: 'PYQ practice',
    //   route: 'PYQPractice',
    // },
    {
      id: 'weak',
      title: 'Weak Areas',
      icon: 'fitness',
      description: 'Improve concepts',
      route: 'WeakConceptPractice',
    },
  ];

  const handlePracticeMode = (mode: any) => {
    // Daily Practice and Subject-wise are enabled
    if (mode.id === 'daily') {
      navigation.navigate(mode.route, { examId: user?.primaryExam });
    } else if (mode.id === 'subject') {
      // Navigate to SubjectList with exam details
      const examId = user?.selectedExams?.[0]?._id || user?.selectedExams?.[0] || user?.primaryExam;
      const examName = user?.selectedExams?.[0]?.name || user?.selectedExams?.[0]?.examName || 'Exam';
      navigation.navigate(mode.route, { examId, examName });
    } else {
      // Show toast for other modes
      showInfoToast('Coming Soon! This feature will be available soon.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header
        title="Practice"
        showBackButton={false}
      />

      {/* Practice Modes */}
      <View style={styles.section}>
        {practiceModes.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            style={styles.modeCard}
            onPress={() => handlePracticeMode(mode)}
            activeOpacity={0.7}
          >
            <View style={styles.modeLeft}>
              <View style={styles.modeIconContainer}>
                <CustomIcon name={mode.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>{mode.title}</Text>
                <Text style={styles.modeDescription}>{mode.description}</Text>
              </View>
            </View>
            <CustomIcon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Weak Concepts Section */}
      {weakConcepts.length > 0 && (
        <View style={styles.weakSection}>
          <Text style={styles.weakSectionTitle}>Improve</Text>
          {weakConcepts.map((concept, index) => (
            <TouchableOpacity
              key={concept.conceptId}
              style={styles.weakConceptCard}
              onPress={() =>
                navigation.navigate('ConceptPractice', {
                  conceptId: concept.conceptId,
                  conceptName: concept.conceptName,
                })
              }
            >
              <View style={styles.weakConceptLeft}>
                <Text style={styles.weakConceptName} numberOfLines={1}>
                  {concept.conceptName}
                </Text>
              </View>
              <Text style={styles.weakConceptAccuracy}>
                {concept.accuracy.toFixed(0)}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom Padding for Tab Bar */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIconContainer: {
    marginRight: 12,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  weakSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  weakSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weakConceptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weakConceptLeft: {
    flex: 1,
  },
  weakConceptName: {
    fontSize: 14,
    color: '#111827',
  },
  weakConceptAccuracy: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default PracticeScreen;

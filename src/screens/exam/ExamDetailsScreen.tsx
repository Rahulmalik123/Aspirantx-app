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
import examService from '../../api/services/examService';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

interface ExamDetails {
  _id: string;
  name: string;
  examCode: string;
  categoryId: string;
  categoryName: string;
  fullName?: string;
  shortDescription?: string;
  description: string;
  conductingBody?: string;
  level?: string;
  frequency?: string;
  mode?: string;
  language?: string[];
  patternDetails?: {
    totalQuestions: number;
    totalMarks: number;
    duration: number;
    negativeMarking: boolean;
    negativeMarkingRatio?: string;
    sections?: any[];
  };
  syllabus: Array<{ 
    subjectId: string;
    subjectName: string;
    topics: string[];
  }>;
  eligibility?: {
    ageLimit?: { min?: number; max?: number } | string;
    qualification?: string;
    nationality?: string;
  } | string;
  totalQuestions: number;
  totalStudents: number;
  totalTests: number;
  isActive: boolean;
  isFeatured: boolean;
}

const ExamDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId } = route.params;
  
  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExamDetails();
  }, []);

  const fetchExamDetails = async () => {
    try {
      const data = await examService.getExamDetails(examId);
      setExam(data.data);
    } catch (error) {
      console.error('Failed to fetch exam details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Exam not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Exam Details" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.examHeader}>
            <Text style={styles.examName}>{exam.name}</Text>
            <Text style={styles.examCode}>{exam.examCode.toUpperCase()}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('TestList', { 
                examId: exam._id,
                examName: exam.name 
              })}
            >
              <CustomIcon name="document-text" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>Mock Tests</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('DailyPractice')}
            >
              <CustomIcon name="flash" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Practice</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.additionalActions}>
            <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('SubjectList', { 
                examId: exam._id,
                examName: exam.name 
              })}
            >
              <CustomIcon name="library-outline" size={18} color="#059669" />
              <Text style={[styles.outlineButtonText, { color: '#059669' }]}>Subject Tests</Text>
            </TouchableOpacity>

            {/* PYQ Button - Temporarily Commented Out */}
            {/* <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('PYQPractice', { examId: exam._id })}
            >
              <CustomIcon name="calendar-outline" size={18} color="#6B7280" />
              <Text style={styles.outlineButtonText}>PYQ</Text>
            </TouchableOpacity> */}

            {/* Analytics Button - Commented Out */}
            {/* <TouchableOpacity 
              style={styles.outlineButton}
              onPress={() => navigation.navigate('Analytics')}
            >
              <CustomIcon name="stats-chart-outline" size={18} color="#6B7280" />
              <Text style={styles.outlineButtonText}>Analytics</Text>
            </TouchableOpacity> */}
          </View>

          {/* Quick Stats */}
          {exam.patternDetails && (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <CustomIcon name="document-text" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{exam.patternDetails.totalQuestions}</Text>
                <Text style={styles.statLabel}>Questions</Text>
              </View>
              <View style={styles.statBox}>
                <CustomIcon name="time" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{exam.patternDetails.duration}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statBox}>
                <CustomIcon name="trophy" size={20} color={COLORS.primary} />
                <Text style={styles.statValue}>{exam.patternDetails.totalMarks}</Text>
                <Text style={styles.statLabel}>Marks</Text>
              </View>
            </View>
          )}

          {/* Compact Info */}
          <View style={styles.compactInfo}>
            {exam.conductingBody && (
              <View style={styles.compactRow}>
                <CustomIcon name="business" size={16} color="#6B7280" />
                <Text style={styles.compactText}>{exam.conductingBody}</Text>
              </View>
            )}
            {exam.mode && (
              <View style={styles.compactRow}>
                <CustomIcon name="desktop" size={16} color="#6B7280" />
                <Text style={styles.compactText}>{exam.mode}</Text>
              </View>
            )}
            {exam.language && exam.language.length > 0 && (
              <View style={styles.compactRow}>
                <CustomIcon name="language" size={16} color="#6B7280" />
                <Text style={styles.compactText}>{exam.language.join(', ')}</Text>
              </View>
            )}
          </View>

          {/* Syllabus */}
          {exam.syllabus && exam.syllabus.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Syllabus ({exam.syllabus.length} Subjects)</Text>
              <View style={styles.syllabusGrid}>
                {exam.syllabus.map((item, index) => (
                  <View key={item.subjectId || index} style={styles.syllabusChip}>
                    <Text style={styles.syllabusText}>{item.subjectName}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  examHeader: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  examName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
  },
  examCode: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  compactInfo: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    fontFamily: 'Poppins-Bold',
  },
  syllabusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  syllabusChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  syllabusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    fontFamily: 'Poppins-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Poppins-SemiBold',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  additionalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'Poppins-SemiBold',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default ExamDetailsScreen;

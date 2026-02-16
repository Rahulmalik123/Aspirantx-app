import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  difficulty: string;
  pyqDetails?: {
    year: number;
    shift?: string;
  };
}

const PYQPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedShift, setSelectedShift] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const examId = route.params?.examId || user?.primaryExam;

  // Generate years from current year to 10 years back
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const shifts = [
    { label: 'All Shifts', value: undefined },
    { label: 'Shift 1', value: 'shift1' },
    { label: 'Shift 2', value: 'shift2' },
    { label: 'Shift 3', value: 'shift3' },
  ];

  const fetchPYQs = async (pageNum: number = 1) => {
    if (!examId) {
      Alert.alert('Error', 'Please select an exam first');
      return;
    }

    setLoading(true);
    try {
      const response = await practiceService.getPYQs(
        examId,
        selectedYear,
        selectedShift,
        pageNum,
        20
      );

      if (response?.questions) {
        setQuestions(response.questions);
        setTotalPages(response.pagination?.pages || 1);
        setPage(pageNum);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch PYQs:', error);
      Alert.alert('Error', 'Failed to load PYQ questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPYQs(1);
  }, [selectedYear, selectedShift]);

  const startPractice = () => {
    if (questions.length === 0) {
      Alert.alert('No Questions', 'No PYQ questions available for the selected criteria');
      return;
    }

    navigation.navigate('QuestionPractice', {
      questions,
      title: `PYQ Practice${selectedYear ? ` - ${selectedYear}` : ''}`,
      mode: 'pyq',
    });
  };

  return (
    <View style={styles.container}>
      <Header title="PYQ Practice" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📝</Text>
          <Text style={styles.infoTitle}>Previous Year Questions</Text>
          <Text style={styles.infoDescription}>
            Practice with authentic exam questions from previous years to
            understand the exam pattern and difficulty level.
          </Text>
        </View>

        {/* Year Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearsScroll}
          >
            <TouchableOpacity
              style={[
                styles.yearCard,
                selectedYear === undefined && styles.yearCardSelected,
              ]}
              onPress={() => setSelectedYear(undefined)}
            >
              <Text
                style={[
                  styles.yearText,
                  selectedYear === undefined && styles.yearTextSelected,
                ]}
              >
                All Years
              </Text>
            </TouchableOpacity>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearCard,
                  selectedYear === year && styles.yearCardSelected,
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearText,
                    selectedYear === year && styles.yearTextSelected,
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shift Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Shift</Text>
          <View style={styles.shiftsRow}>
            {shifts.map((shift) => (
              <TouchableOpacity
                key={shift.label}
                style={[
                  styles.shiftCard,
                  selectedShift === shift.value && styles.shiftCardSelected,
                ]}
                onPress={() => setSelectedShift(shift.value)}
              >
                <Text
                  style={[
                    styles.shiftText,
                    selectedShift === shift.value && styles.shiftTextSelected,
                  ]}
                >
                  {shift.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Questions Count */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        ) : (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <CustomIcon name="document-text" size={20} color={COLORS.primary} />
              <Text style={styles.summaryText}>
                {questions.length} questions available
              </Text>
            </View>
            {selectedYear && (
              <View style={styles.summaryRow}>
                <CustomIcon name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.summaryText}>Year: {selectedYear}</Text>
              </View>
            )}
            {selectedShift && (
              <View style={styles.summaryRow}>
                <CustomIcon name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.summaryText}>
                  {shifts.find((s) => s.value === selectedShift)?.label}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (loading || questions.length === 0) && styles.startButtonDisabled,
          ]}
          onPress={startPractice}
          disabled={loading || questions.length === 0}
        >
          <Text style={styles.startButtonText}>
            {questions.length > 0 ? 'Start Practice' : 'No Questions Available'}
          </Text>
          {questions.length > 0 && (
            <CustomIcon name="arrow-forward" size={20} color="#FFF" />
          )}
        </TouchableOpacity>

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => fetchPYQs(page - 1)}
              disabled={page === 1}
            >
              <CustomIcon name="chevron-back" size={20} color={page === 1 ? '#9CA3AF' : COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.pageText}>
              Page {page} of {totalPages}
            </Text>
            <TouchableOpacity
              style={[
                styles.pageButton,
                page === totalPages && styles.pageButtonDisabled,
              ]}
              onPress={() => fetchPYQs(page + 1)}
              disabled={page === totalPages}
            >
              <CustomIcon name="chevron-forward" size={20} color={page === totalPages ? '#9CA3AF' : COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  yearsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  yearCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  yearCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  yearTextSelected: {
    color: COLORS.primary,
  },
  shiftsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  shiftCard: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  shiftCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  shiftText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  shiftTextSelected: {
    color: COLORS.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pageButtonDisabled: {
    opacity: 0.4,
  },
  pageText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
});

export default PYQPracticeScreen;

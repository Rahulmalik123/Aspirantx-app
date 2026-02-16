import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/colors';
import examService from '../../api/services/examService';
import userService from '../../api/services/userService';
import { setUser } from '../../store/slices/authSlice';

interface Category {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  examCount: number;
}

interface Exam {
  _id: string;
  name: string;
  examCode: string;
  description: string;
  category: string;
}

const ExamSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState<'category' | 'exam'>('category');
  const [categories, setCategories] = useState<Category[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await examService.getCategories();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async (categoryId: string) => {
    setLoading(true);
    try {
      const data = await examService.getExamsByCategory(categoryId);
      setExams(data.data || []);
      setStep('exam');
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      Alert.alert('Error', 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchExams(categoryId);
  };

  const handleExamSelect = (examId: string) => {
    setSelectedExams(prev => {
      if (prev.includes(examId)) {
        // Remove if already selected
        return prev.filter(id => id !== examId);
      } else {
        // Add to selection
        return [...prev, examId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedExams.length === 0) {
      Alert.alert('Error', 'Please select at least one exam');
      return;
    }

    setSaving(true);
    try {
      // Update user profile with selected exams
      const updatedUser = await userService.updateProfile({
        primaryExam: selectedExams[0], // First selected exam as primary
        targetExams: selectedExams,
      });

      // Update Redux store with the updated user data
      dispatch(setUser(updatedUser));

      // Navigation will happen automatically via AppNavigator's conditional logic
      console.log('✅ Exam selection saved successfully:', updatedUser);
    } catch (error) {
      console.error('Failed to save exam selection:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.card,
        selectedCategory === item._id && styles.selectedCard,
      ]}
      onPress={() => handleCategorySelect(item._id)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{item.icon || '📚'}</Text>
        <View style={styles.examCountBadge}>
          <Text style={styles.examCountText}>{item.examCount} exams</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  const renderExam = ({ item }: { item: Exam }) => {
    const isSelected = selectedExams.includes(item._id);
    return (
      <TouchableOpacity
        style={[
          styles.examCard,
          isSelected && styles.selectedExamCard,
        ]}
        onPress={() => handleExamSelect(item._id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.examInfo}>
          <Text style={styles.examName}>{item.name}</Text>
          <Text style={styles.examCode}>{item.examCode}</Text>
          <Text style={styles.examDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && step === 'category') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {step === 'exam' && (
          <TouchableOpacity
            onPress={() => {
              setStep('category');
              setSelectedExams([]);
            }}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.stepText}>
            Step {step === 'category' ? '1' : '2'} of 2
          </Text>
          <Text style={styles.title}>
            {step === 'category' ? 'Choose Category' : 'Select Your Exam'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'category'
              ? 'Select the exam category you are preparing for'
              : 'Select one or more exams you want to focus on'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={step === 'category' ? categories : exams}
          renderItem={step === 'category' ? renderCategory : renderExam}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={step === 'category' ? 2 : 1}
          key={step} // Force re-render when step changes
        />
      )}

      {/* Footer */}
      {step === 'exam' && (
        <View style={styles.footer}>
          {selectedExams.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedExams.length} exam{selectedExams.length > 1 ? 's' : ''} selected
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (selectedExams.length === 0 || saving) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={selectedExams.length === 0 || saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.continueButtonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 12,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
  },
  headerContent: {
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    padding: 16,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  examCountBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  examCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedExamCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: COLORS.white,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  examCode: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  examDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  selectedCount: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ExamSelectionScreen;

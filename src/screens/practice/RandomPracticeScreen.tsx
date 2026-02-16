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
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

const RandomPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);

  const examId = route.params?.examId || user?.primaryExam;

  const difficulties = [
    { label: 'All', value: undefined },
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ];

  const counts = [5, 10, 15, 20, 25, 30];

  const startPractice = async () => {
    if (!examId) {
      Alert.alert('Error', 'Please select an exam first');
      return;
    }

    setLoading(true);
    try {
      const response = await practiceService.getRandomQuestions(
        examId,
        count,
        difficulty
      );

      if (response?.length > 0) {
        navigation.navigate('QuestionPractice', {
          questions: response,
          title: 'Random Practice',
          mode: 'random',
        });
      } else {
        Alert.alert('No Questions', 'No questions available for the selected criteria');
      }
    } catch (error) {
      console.error('Failed to fetch random questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Random Practice" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🎲</Text>
          <Text style={styles.infoTitle}>Test Your Skills</Text>
          <Text style={styles.infoDescription}>
            Practice with randomly selected questions to challenge yourself and
            improve your overall understanding.
          </Text>
        </View>

        {/* Question Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <View style={styles.optionsGrid}>
            {counts.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.optionCard,
                  count === c && styles.optionCardSelected,
                ]}
                onPress={() => setCount(c)}
              >
                <Text
                  style={[
                    styles.optionText,
                    count === c && styles.optionTextSelected,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((d) => (
              <TouchableOpacity
                key={d.label}
                style={[
                  styles.difficultyCard,
                  difficulty === d.value && styles.difficultyCardSelected,
                ]}
                onPress={() => setDifficulty(d.value)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    difficulty === d.value && styles.difficultyTextSelected,
                  ]}
                >
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Info */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <CustomIcon name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.summaryText}>
              {count} {difficulty ? difficulty : 'mixed'} questions
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <CustomIcon name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.summaryText}>
              Estimated time: {Math.ceil(count * 1.5)} mins
            </Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={startPractice}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.startButtonText}>Start Practice</Text>
              <CustomIcon name="arrow-forward" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>

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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: 80,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextSelected: {
    color: COLORS.primary,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyCard: {
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
  difficultyCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  difficultyTextSelected: {
    color: COLORS.primary,
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
});

export default RandomPracticeScreen;

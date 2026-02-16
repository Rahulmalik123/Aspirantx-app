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
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

const ConceptPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conceptId, conceptName } = route.params;

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  const [limit, setLimit] = useState(20);

  const difficulties = [
    { label: 'All', value: undefined },
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
  ];

  const limits = [10, 20, 30, 50];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await practiceService.getQuestionsByConcept(
        conceptId,
        limit,
        difficulty,
        1
      );

      if (response?.questions) {
        setQuestions(response.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch concept questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [difficulty, limit]);

  const startPractice = () => {
    if (questions.length === 0) {
      Alert.alert('No Questions', 'No questions available for this concept');
      return;
    }

    navigation.navigate('QuestionPractice', {
      questions,
      title: conceptName,
      mode: 'concept',
      conceptId,
    });
  };

  return (
    <View style={styles.container}>
      <Header title={conceptName} onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💪</Text>
          <Text style={styles.infoTitle}>Master This Concept</Text>
          <Text style={styles.infoDescription}>
            Practice focused questions on {conceptName} to strengthen your
            understanding and improve your accuracy.
          </Text>
        </View>

        {/* Number of Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <View style={styles.limitsRow}>
            {limits.map((l) => (
              <TouchableOpacity
                key={l}
                style={[
                  styles.limitCard,
                  limit === l && styles.limitCardSelected,
                ]}
                onPress={() => setLimit(l)}
              >
                <Text
                  style={[
                    styles.limitText,
                    limit === l && styles.limitTextSelected,
                  ]}
                >
                  {l}
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
            <View style={styles.summaryRow}>
              <CustomIcon name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.summaryText}>
                Estimated time: {Math.ceil(questions.length * 1.5)} mins
              </Text>
            </View>
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
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
  limitsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  limitCard: {
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
  limitCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  limitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  limitTextSelected: {
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

export default ConceptPracticeScreen;

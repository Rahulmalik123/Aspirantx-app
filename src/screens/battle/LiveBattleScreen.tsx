import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { battleService } from '../../api/services';

type LiveBattleScreenRouteProp = RouteProp<RootStackParamList, 'LiveBattle'>;
type LiveBattleScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LiveBattle'
>;

type Props = {
  route: LiveBattleScreenRouteProp;
  navigation: LiveBattleScreenNavigationProp;
};

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface Battle {
  _id: string;
  participants: {
    userId: string;
    name: string;
    score: number;
    answeredQuestions: number;
  }[];
  questions: Question[];
  status: 'waiting' | 'active' | 'completed';
  startTime?: string;
  endTime?: string;
}

const LiveBattleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { battleId } = route.params;
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);

  useEffect(() => {
    fetchBattle();
    const interval = setInterval(fetchBattle, 5000); // Refresh battle state every 5 seconds
    return () => clearInterval(interval);
  }, [battleId]);

  useEffect(() => {
    if (battle?.status === 'active' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleNextQuestion();
    }
  }, [timeRemaining, battle?.status]);

  const fetchBattle = async () => {
    try {
      const response = await battleService.getBattle(battleId);
      setBattle(response);
    } catch (error) {
      console.error('Error fetching battle:', error);
      Alert.alert('Error', 'Failed to load battle details');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    
    try {
      await battleService.submitAnswer(battleId, {
        questionId: battle?.questions[currentQuestionIndex]._id,
        answer: answerIndex,
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (battle && currentQuestionIndex < battle.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeRemaining(30);
    } else {
      // Battle completed
      navigation.replace('BattleResult', { battleId });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading Battle...</Text>
      </View>
    );
  }

  if (!battle) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Battle not found</Text>
      </View>
    );
  }

  const currentQuestion = battle.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      {/* Header with scores */}
      <View style={styles.header}>
        <View style={styles.participantsContainer}>
          {battle.participants.map((participant, index) => (
            <View key={participant.userId} style={styles.participantCard}>
              <Text style={styles.participantName}>{participant.name}</Text>
              <Text style={styles.participantScore}>{participant.score} pts</Text>
            </View>
          ))}
        </View>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{timeRemaining}s</Text>
        </View>
      </View>

      {/* Question Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {battle.questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestionIndex + 1) / battle.questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctAnswer;
            const showResult = selectedAnswer !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.selectedOption,
                  showResult && isCorrect && styles.correctOption,
                  showResult && isSelected && !isCorrect && styles.wrongOption,
                ]}
                onPress={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
              >
                <Text style={[
                  styles.optionText,
                  isSelected && styles.selectedOptionText,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedAnswer !== null && (
          <TouchableOpacity 
            style={styles.nextButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestionIndex < battle.questions.length - 1 ? 'Next Question' : 'View Results'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  participantCard: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  participantScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  timerContainer: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 26,
  },
  optionsContainer: {
    padding: 16,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedOption: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF5F5',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default LiveBattleScreen;

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/MainNavigator';
import { COLORS } from '../../constants/colors';
import battleService, { Battle, BattleQuestion } from '../../api/services/battleService';
import CustomIcon from '../../components/CustomIcon';

type Props = {
  route: RouteProp<RootStackParamList, 'LiveBattle'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'LiveBattle'>;
};

const QUESTION_TIME = 30;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const LiveBattleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { battleId } = route.params;

  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadBattle();
    pollRef.current = setInterval(loadBattle, 6000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [battleId]);

  useEffect(() => {
    if (!battle || battle.status !== 'ongoing') return;
    setTimeLeft(QUESTION_TIME);
    questionStartTime.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (selectedOption === null) handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, battle?.status]);

  const hasResumed = useRef(false);

  const loadBattle = async () => {
    try {
      const data = await battleService.getBattle(battleId);
      setBattle(data);
      if (data.status === 'completed') {
        navigation.replace('BattleResult', { battleId });
        return;
      }
      // On first load, resume from where user left off
      if (!hasResumed.current && data.myAnsweredCount != null && data.myAnsweredCount > 0) {
        hasResumed.current = true;
        const total = data.questions.length;
        if (data.myAnsweredCount >= total) {
          // All questions already answered, go to results
          navigation.replace('BattleResult', { battleId });
          return;
        }
        setCurrentIndex(data.myAnsweredCount);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (optionIndex: number) => {
    if (selectedOption !== null || submitting) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(optionIndex);
    setSubmitting(true);

    const question = battle!.questions[currentIndex] as BattleQuestion;
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);

    try {
      const result = await battleService.submitAnswer(battleId, {
        questionId: question._id,
        selectedOption: optionIndex,
        timeTaken,
      });
      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer);
      if (result.isCorrect) setScore((s) => s + 1);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimeout = async () => {
    const question = battle!.questions[currentIndex] as BattleQuestion;
    try {
      await battleService.submitAnswer(battleId, {
        questionId: question._id,
        selectedOption: -1,
        timeTaken: QUESTION_TIME,
      });
    } catch {
      // silent
    }
    goNext();
  };

  const goNext = () => {
    if (!battle) return;
    const total = battle.questions.length;
    if (currentIndex < total - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setCorrectAnswer(null);
    } else {
      navigation.replace('BattleResult', { battleId });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading battle...</Text>
      </View>
    );
  }

  if (!battle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Battle not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 14, color: COLORS.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Waiting room — creator waits for opponent
  if (battle.status === 'waiting') {
    return (
      <View style={styles.waitingContainer}>
        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.waitingTitle}>Waiting for opponent...</Text>
          <Text style={styles.waitingSubtitle}>
            Share the invite code with your opponent to start the battle
          </Text>
          {battle.inviteCode && (
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCodeLabel}>Invite Code</Text>
              <Text style={styles.inviteCodeText}>{battle.inviteCode}</Text>
            </View>
          )}
          <View style={styles.waitingInfo}>
            <View style={styles.waitingInfoRow}>
              <CustomIcon name="book-outline" size={14} color="#6B7280" />
              <Text style={styles.waitingInfoText}>
                {battle.exam?.name ?? 'Battle'} · {battle.subject?.name ?? ''}
              </Text>
            </View>
            <View style={styles.waitingInfoRow}>
              <CustomIcon name="cash-outline" size={14} color="#F59E0B" />
              <Text style={styles.waitingInfoText}>
                Prize: {battle.prizePool} coins
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cancelWaitBtn}
            onPress={() => navigation.replace('BattleList')}
          >
            <Text style={styles.cancelWaitText}>Cancel &amp; Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const questions = battle.questions as BattleQuestion[];
  const total = questions.length;
  const question = questions[currentIndex];
  const progress = (currentIndex + 1) / total;
  const timerColor = timeLeft <= 10 ? '#EF4444' : COLORS.primary;
  const timerBg = timeLeft <= 10 ? '#FEF2F2' : COLORS.primary + '10';

  const getOptionStyle = (i: number) => {
    if (selectedOption === null) return styles.option;
    if (i === correctAnswer) return [styles.option, styles.optionCorrect];
    if (i === selectedOption && !isCorrect) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDimmed];
  };

  const getOptionLabelStyle = (i: number) => {
    if (selectedOption === null) return styles.optionLabel;
    if (i === correctAnswer) return [styles.optionLabel, styles.optionLabelCorrect];
    if (i === selectedOption && !isCorrect) return [styles.optionLabel, styles.optionLabelWrong];
    return styles.optionLabel;
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.playerCard}>
          <Text style={styles.playerName} numberOfLines={1}>
            {battle.creator?.name ?? 'You'}
          </Text>
          <Text style={styles.playerScore}>{score}</Text>
        </View>

        <View style={[styles.timerBox, { backgroundColor: timerBg }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}</Text>
          <Text style={[styles.timerSub, { color: timerColor }]}>sec</Text>
        </View>

        <View style={[styles.playerCard, styles.playerCardRight]}>
          <Text style={styles.playerName} numberOfLines={1}>
            {battle.opponent?.name ?? 'Opponent'}
          </Text>
          <Text style={styles.playerScore}>—</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressWrapper}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>{currentIndex + 1}/{total}</Text>
      </View>

      {/* Question + Options */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <Text style={styles.questionNum}>Question {currentIndex + 1}</Text>
          <Text style={styles.questionText}>{question?.questionText}</Text>
        </View>

        <View style={styles.optionsWrapper}>
          {(question?.options ?? []).map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={getOptionStyle(i)}
              onPress={() => handleSelect(i)}
              disabled={selectedOption !== null || submitting}
              activeOpacity={0.75}
            >
              <View style={getOptionLabelStyle(i)}>
                <Text style={styles.optionLabelText}>{OPTION_LABELS[i]}</Text>
              </View>
              <Text style={styles.optionText}>
                {typeof opt === 'string' ? opt : (opt as any).text}
              </Text>
              {submitting && selectedOption === i && (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback + Next */}
        {selectedOption !== null && (
          <View style={styles.feedbackRow}>
            <View style={[styles.feedbackBadge, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <CustomIcon
                name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={isCorrect ? '#065F46' : '#991B1B'}
              />
              <Text style={styles.feedbackText}>{isCorrect ? 'Correct' : 'Wrong'}</Text>
            </View>
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>
                {currentIndex < total - 1 ? 'Next →' : 'Finish'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  errorText: { fontSize: 16, color: '#374151', fontWeight: '600' },

  // Waiting room
  waitingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  waitingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  waitingTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  waitingSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 18 },
  inviteCodeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    width: '100%',
  },
  inviteCodeLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 4 },
  inviteCodeText: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: 6 },
  waitingInfo: { width: '100%', gap: 8 },
  waitingInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  waitingInfoText: { fontSize: 13, color: '#6B7280' },
  cancelWaitBtn: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelWaitText: { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  playerCard: { flex: 1, gap: 2 },
  playerCardRight: { alignItems: 'flex-end' },
  playerName: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  playerScore: { fontSize: 24, fontWeight: '800', color: COLORS.primary },

  timerBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  timerText: { fontSize: 20, fontWeight: '800', lineHeight: 22 },
  timerSub: { fontSize: 10, fontWeight: '600', lineHeight: 12 },

  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressLabel: { fontSize: 12, fontWeight: '600', color: '#6B7280', width: 36, textAlign: 'right' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 32 },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  questionNum: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: { fontSize: 16, fontWeight: '600', color: '#111827', lineHeight: 24 },

  optionsWrapper: { gap: 10 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  optionDimmed: { opacity: 0.45 },

  optionLabel: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabelCorrect: { backgroundColor: '#10B981' },
  optionLabelWrong: { backgroundColor: '#EF4444' },
  optionLabelText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 20 },

  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  feedbackBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  feedbackCorrect: { backgroundColor: '#D1FAE5' },
  feedbackWrong: { backgroundColor: '#FEE2E2' },
  feedbackText: { fontSize: 13, fontWeight: '700', color: '#111827' },

  nextBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

export default LiveBattleScreen;

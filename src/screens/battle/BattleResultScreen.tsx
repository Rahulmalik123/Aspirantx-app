import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import battleService, { Battle } from '../../api/services/battleService';
import CustomIcon from '../../components/CustomIcon';
import { RootState } from '../../store';

type RouteParams = { battleId: string };

const BattleResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { battleId } = (route.params ?? {}) as RouteParams;

  const currentUserId = useSelector((state: RootState) => state.auth.user?._id);

  const [result, setResult] = useState<{
    battle: Battle;
    creatorScore: number;
    opponentScore: number;
    bothCompleted: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(!!battleId);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchResults = async () => {
    if (!battleId) return;
    try {
      const data: any = await battleService.getBattleResults(battleId);
      setResult(data);
      // Stop polling once both players have finished
      if (data.bothCompleted && pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // Poll every 5 seconds until opponent finishes
    pollRef.current = setInterval(fetchResults, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [battleId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ── Waiting for opponent to finish ──────────────────────────────────────────
  if (result && !result.bothCompleted) {
    const waitBattle = result.battle;
    const creatorIdWait =
      (waitBattle?.creator as any)?._id?.toString() ??
      waitBattle?.creator?.toString() ?? '';
    const amICreatorWait = !!currentUserId && creatorIdWait === currentUserId;
    const myWaitScore = amICreatorWait ? result.creatorScore : result.opponentScore;
    const totalQ = waitBattle?.totalQuestions ?? 10;

    return (
      <View style={styles.waitingContainer}>
        <View style={styles.waitingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.waitingTitle}>You've finished!</Text>
          <Text style={styles.waitingSubtitle}>
            Waiting for your opponent to complete the battle...
          </Text>

          <View style={styles.myScoreBox}>
            <Text style={styles.myScoreLabel}>Your Score</Text>
            <Text style={styles.myScoreValue}>
              {myWaitScore}
              <Text style={styles.myScoreTotal}>/{totalQ}</Text>
            </Text>
          </View>

          <Text style={styles.waitingHint}>Results will appear automatically</Text>
        </View>
      </View>
    );
  }

  // ── Final result ─────────────────────────────────────────────────────────────
  const battle = result?.battle;
  const isDraw = battle?.isDraw ?? false;
  const isFree = battle?.isFree ?? false;
  const battleCoinType = battle?.coinType ?? 'paid';
  const coinLabel = battleCoinType === 'free' ? 'free' : 'paid';
  const prizePool = battle?.prizePool ?? 0;
  const platformCut = battle?.platformCut ?? 0;
  const entryFee = battle?.entryFee ?? 0;
  const totalQuestions = battle?.totalQuestions ?? 10;

  // Determine if the current user is creator or opponent
  const creatorId =
    (battle?.creator as any)?._id?.toString() ??
    battle?.creator?.toString() ?? '';
  const amICreator = !!currentUserId && creatorId === currentUserId;

  const creatorScore = result?.creatorScore ?? 0;
  const opponentScore = result?.opponentScore ?? 0;
  const myScore = amICreator ? creatorScore : opponentScore;
  const theirScore = amICreator ? opponentScore : creatorScore;
  const opponentName = amICreator
    ? (battle?.opponent?.name ?? 'Opponent')
    : (battle?.creator?.name ?? 'Creator');

  // Correctly determine winner for current user
  const winnerId =
    (battle?.winner as any)?._id ??
    (battle?.winner as any)?.toString?.() ??
    '';
  const isWinner = !isDraw && !!winnerId && winnerId === currentUserId;

  type ResultState = 'win' | 'lose' | 'draw';
  const resultState: ResultState = isDraw ? 'draw' : isWinner ? 'win' : 'lose';

  const resultConfig = {
    win:  { icon: 'trophy',                iconColor: '#10B981', title: 'You Won!',      bg: '#F0FDF4', textColor: '#14532D' },
    lose: { icon: 'sad-outline',           iconColor: '#EF4444', title: 'You Lost',      bg: '#FEF2F2', textColor: '#7F1D1D' },
    draw: { icon: 'remove-circle-outline', iconColor: '#3B82F6', title: "It's a Draw!",  bg: '#EFF6FF', textColor: '#1E3A5F' },
  }[resultState];

  const myAccuracy = totalQuestions > 0 ? Math.round((myScore / totalQuestions) * 100) : 0;
  const myWrong = totalQuestions - myScore;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>Battle Result</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.closeBtn}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Result Banner */}
        <View style={[styles.resultBanner, { backgroundColor: resultConfig.bg }]}>
          <CustomIcon name={resultConfig.icon} size={64} color={resultConfig.iconColor} />
          <Text style={[styles.resultTitle, { color: resultConfig.textColor }]}>
            {resultConfig.title}
          </Text>
          {battle && (
            <Text style={[styles.resultSub, { color: resultConfig.textColor + 'AA' }]}>
              {battle.exam?.name ?? ''}{battle.difficulty ? ` · ${battle.difficulty}` : ''} · {totalQuestions} questions
            </Text>
          )}
        </View>

        {/* Score Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Score</Text>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreBoxLabel}>You</Text>
              <Text style={[styles.scoreBoxValue, { color: resultState === 'win' ? '#10B981' : '#6B7280' }]}>
                {myScore}
              </Text>
              <Text style={styles.scoreBoxSub}>/{totalQuestions}</Text>
            </View>

            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreBoxLabel}>{opponentName}</Text>
              <Text style={[styles.scoreBoxValue, { color: resultState === 'lose' ? '#EF4444' : '#6B7280' }]}>
                {theirScore}
              </Text>
              <Text style={styles.scoreBoxSub}>/{totalQuestions}</Text>
            </View>
          </View>
        </View>

        {/* Coins Card */}
        {!isFree && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.cardLabel}>Coins</Text>
              <View style={[styles.coinTypeBadge, battleCoinType === 'free' ? styles.coinTypeBadgeFree : styles.coinTypeBadgePaid]}>
                <Text style={[styles.coinTypeBadgeText, { color: battleCoinType === 'free' ? '#92400E' : '#065F46' }]}>
                  {battleCoinType === 'free' ? 'FREE COINS' : 'PAID COINS'}
                </Text>
              </View>
            </View>
            {isDraw ? (
              <>
                <View style={styles.coinRow}>
                  <CustomIcon name="cash-outline" size={22} color="#F59E0B" />
                  <Text style={[styles.coinValue, { color: '#3B82F6' }]}>+{entryFee}</Text>
                  <Text style={styles.coinNote}>Refunded ({coinLabel})</Text>
                </View>
                <Text style={styles.platformNote}>Draw — full entry fee returned</Text>
              </>
            ) : resultState === 'win' ? (
              <>
                <View style={styles.coinRow}>
                  <CustomIcon name="cash-outline" size={22} color="#F59E0B" />
                  <Text style={[styles.coinValue, { color: '#10B981' }]}>+{prizePool}</Text>
                  <Text style={styles.coinNote}>Prize earned ({coinLabel})</Text>
                </View>
                {platformCut > 0 && (
                  <Text style={styles.platformNote}>
                    Platform fee {platformCut} coins deducted from pool
                  </Text>
                )}
                {battleCoinType === 'free' && (
                  <Text style={styles.platformNote}>Free coin winnings cannot be withdrawn</Text>
                )}
              </>
            ) : (
              <View style={styles.coinRow}>
                <CustomIcon name="cash-outline" size={22} color="#F59E0B" />
                <Text style={[styles.coinValue, { color: '#EF4444' }]}>-{entryFee}</Text>
                <Text style={styles.coinNote}>Entry fee lost ({coinLabel})</Text>
              </View>
            )}
          </View>
        )}

        {/* Performance */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your Performance</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{myScore}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{myWrong}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>{myAccuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('BattleList')}>
          <Text style={styles.primaryBtnText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.secondaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Waiting state ──────────────────────────────────────────────────────────
  waitingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  waitingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  waitingTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  waitingSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  myScoreBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 4,
  },
  myScoreLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  myScoreValue: { fontSize: 48, fontWeight: '800', color: COLORS.primary, lineHeight: 52 },
  myScoreTotal: { fontSize: 20, fontWeight: '600', color: '#9CA3AF' },
  waitingHint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeBtn: { width: 36, alignItems: 'flex-end' },
  closeIcon: { fontSize: 28, color: '#6B7280', lineHeight: 32 },

  content: { padding: 16, gap: 12, paddingBottom: 40 },

  resultBanner: {
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: { fontSize: 26, fontWeight: '800' },
  resultSub: { fontSize: 13, fontWeight: '500', marginTop: 2, textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    gap: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scoreBox: { flex: 1, alignItems: 'center', gap: 2 },
  scoreBoxLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  scoreBoxValue: { fontSize: 40, fontWeight: '800', lineHeight: 44 },
  scoreBoxSub: { fontSize: 12, color: '#9CA3AF' },
  vsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  vsText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },

  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinValue: { fontSize: 28, fontWeight: '800' },
  coinNote: { fontSize: 13, color: '#6B7280', marginLeft: 2 },
  platformNote: { fontSize: 11, color: '#9CA3AF' },

  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  statDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  secondaryBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  coinTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coinTypeBadgePaid: {
    backgroundColor: '#D1FAE5',
  },
  coinTypeBadgeFree: {
    backgroundColor: '#FEF3C7',
  },
  coinTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});

export default BattleResultScreen;

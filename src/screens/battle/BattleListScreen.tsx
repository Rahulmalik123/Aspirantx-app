import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import battleService, { Battle } from '../../api/services/battleService';
import CustomIcon from '../../components/CustomIcon';

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  hard:   { label: 'Hard',   color: '#EF4444' },
  mixed:  { label: 'Mixed',  color: '#8B5CF6' },
};

const DIFFICULTY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'mixed', label: 'Mixed' },
];

const BattleListScreen = () => {
  const navigation = useNavigation<any>();
  const currentUserId = useSelector((state: RootState) => state.auth.user?._id);

  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const [difficultyFilter, setDifficultyFilter] = useState('');

  // My active battles (waiting/ongoing as creator or opponent)
  const [myActiveBattles, setMyActiveBattles] = useState<Battle[]>([]);

  // Pending challenges
  const [challenges, setChallenges] = useState<Battle[]>([]);
  const [decliningId, setDecliningId] = useState<string | null>(null);

  // Join by code
  const [codeModal, setCodeModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joiningByCode, setJoiningByCode] = useState(false);

  const fetchBattles = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params: any = { limit: 30, isFree: false };
      if (difficultyFilter) params.difficulty = difficultyFilter;

      const [response, challengeRes, myBattlesRes] = await Promise.all([
        battleService.getAvailableBattles(params),
        battleService.getPendingChallenges().catch(() => []),
        battleService.getUserBattles().catch(() => ({ data: [] })),
      ]);
      setBattles(Array.isArray(response?.data) ? response.data : []);
      setChallenges(Array.isArray(challengeRes) ? challengeRes : []);
      // Active = waiting or ongoing (creator or opponent)
      const allMine: Battle[] = Array.isArray(myBattlesRes?.data) ? myBattlesRes.data : [];
      setMyActiveBattles(allMine.filter(b => b.status === 'waiting' || b.status === 'ongoing'));
    } catch {
      setBattles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [difficultyFilter]);

  useEffect(() => {
    fetchBattles();
  }, [fetchBattles]);

  const handleDeclineChallenge = async (battleId: string) => {
    setDecliningId(battleId);
    try {
      await battleService.declineChallenge(battleId);
      setChallenges(prev => prev.filter(c => c._id !== battleId));
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to decline');
    } finally {
      setDecliningId(null);
    }
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return;
    setJoiningByCode(true);
    try {
      const battle = await battleService.joinByCode(inviteCode.trim().toUpperCase());
      setCodeModal(false);
      setInviteCode('');
      navigation.navigate('LiveBattle', { battleId: battle._id });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid code or battle unavailable');
    } finally {
      setJoiningByCode(false);
    }
  };

  const handleJoin = async (battle: Battle) => {
    if (!battle.isFree) {
      const coinLabel = battle.coinType === 'free' ? 'free' : 'paid';
      Alert.alert(
        'Join Battle',
        `Entry fee: ${battle.entryFee} ${coinLabel} coins\nWinner gets: ${battle.prizePool} ${coinLabel} coins${battle.coinType === 'free' ? '\n\nNote: Free coin winnings cannot be withdrawn.' : ''}\n\nJoin this battle?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Join', onPress: () => doJoin(battle._id) },
        ]
      );
    } else {
      doJoin(battle._id);
    }
  };

  const doJoin = async (battleId: string) => {
    setJoiningId(battleId);
    try {
      await battleService.joinBattle(battleId);
      navigation.navigate('LiveBattle', { battleId });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to join battle');
    } finally {
      setJoiningId(null);
    }
  };

  const renderBattle = ({ item }: { item: Battle }) => {
    const diff = DIFFICULTY_CONFIG[item.difficulty] ?? { label: item.difficulty, color: '#6B7280' };
    const isJoining = joiningId === item._id;

    return (
      <View style={styles.card}>
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={styles.creatorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.creator?.name?.[0] ?? '?').toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.creatorName}>{item.creator?.name ?? 'Unknown'}</Text>
              <Text style={styles.examName}>{item.exam?.name ?? ''}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {item.coinType === 'free' && (
              <View style={[styles.diffBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.diffText, { color: '#92400E' }]}>FREE</Text>
              </View>
            )}
            <View style={[styles.diffBadge, { backgroundColor: diff.color + '18' }]}>
              <Text style={[styles.diffText, { color: diff.color }]}>{diff.label}</Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Questions</Text>
            <Text style={styles.statValue}>{item.totalQuestions}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Entry</Text>
            <View style={styles.coinRow}>
              {!item.isFree && <CustomIcon name="cash-outline" size={13} color="#F59E0B" />}
              <Text style={styles.statValue}>{item.isFree ? 'FREE' : ` ${item.entryFee}`}</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Prize</Text>
            <View style={styles.coinRow}>
              {!item.isFree && <CustomIcon name="cash-outline" size={13} color="#10B981" />}
              <Text style={[styles.statValue, { color: '#10B981' }]}>{item.isFree ? '—' : ` ${item.prizePool}`}</Text>
            </View>
          </View>
        </View>

        {/* Join button */}
        <TouchableOpacity
          style={[styles.joinBtn, isJoining && { opacity: 0.7 }]}
          onPress={() => handleJoin(item)}
          disabled={isJoining}
        >
          {isJoining ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <View style={styles.joinBtnInner}>
              <Text style={styles.joinBtnText}>{item.isFree ? 'Join Free Battle' : 'Join · '}</Text>
              {!item.isFree && <CustomIcon name="cash-outline" size={14} color="#fff" />}
              {!item.isFree && <Text style={styles.joinBtnText}>{item.entryFee}</Text>}
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeader = (
    <View style={{ gap: 12 }}>
      {/* Action buttons row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('CreateBattle')}
        >
          <CustomIcon name="add-circle-outline" size={16} color="#fff" />
          <Text style={styles.createBtnText}>Create Battle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.codeBtn}
          onPress={() => setCodeModal(true)}
        >
          <CustomIcon name="keypad-outline" size={16} color={COLORS.primary} />
          <Text style={styles.codeBtnText}>Enter Code</Text>
        </TouchableOpacity>
      </View>

      {/* My Active Battles (waiting / ongoing) */}
      {myActiveBattles.length > 0 && (
        <View style={styles.activeBattlesSection}>
          <Text style={styles.activeSectionLabel}>
            My Active Battles ({myActiveBattles.length})
          </Text>
          {myActiveBattles.map((b) => {
            const isOngoing = b.status === 'ongoing';
            const amICreator = b.creator?._id === currentUserId;
            const iFinished = amICreator ? !!b.creatorCompleted : !!b.opponentCompleted;

            // If I've answered all questions, send to results; otherwise rejoin the live battle
            const handlePress = () => {
              if (iFinished) {
                navigation.navigate('BattleResult', { battleId: b._id });
              } else {
                navigation.navigate('LiveBattle', { battleId: b._id });
              }
            };

            return (
              <TouchableOpacity
                key={b._id}
                style={styles.activeBattleRow}
                onPress={handlePress}
              >
                <View style={[styles.activeStatusDot, { backgroundColor: isOngoing ? '#10B981' : '#F59E0B' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activeBattleName} numberOfLines={1}>
                    {b.exam?.name ?? 'Battle'} · {b.subject?.name ?? ''}
                  </Text>
                  <Text style={styles.activeBattleStatus}>
                    {iFinished
                      ? 'Waiting for opponent...'
                      : isOngoing
                      ? 'In Progress'
                      : 'Waiting for opponent...'}
                    {b.inviteCode && !isOngoing && !iFinished ? `  · Code: ${b.inviteCode}` : ''}
                  </Text>
                </View>
                <View style={[styles.rejoinBtn, {
                  backgroundColor: iFinished ? '#EFF6FF' : isOngoing ? '#ECFDF5' : '#FFFBEB',
                }]}>
                  <CustomIcon
                    name={iFinished ? 'hourglass-outline' : isOngoing ? 'play-circle-outline' : 'time-outline'}
                    size={14}
                    color={iFinished ? '#3B82F6' : isOngoing ? '#10B981' : '#F59E0B'}
                  />
                  <Text style={[styles.rejoinBtnText, {
                    color: iFinished ? '#3B82F6' : isOngoing ? '#10B981' : '#F59E0B',
                  }]}>
                    {iFinished ? ' Results' : isOngoing ? ' Rejoin' : ' Wait'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Pending Challenges */}
      {challenges.length > 0 && (
        <View style={styles.challengesSection}>
          <Text style={styles.sectionLabel}>
            <CustomIcon name="flash-outline" size={13} color="#F59E0B" /> Pending Challenges ({challenges.length})
          </Text>
          {challenges.map((c) => {
            const isDeclining = decliningId === c._id;
            return (
              <View key={c._id} style={styles.challengeCard}>
                <View style={styles.challengeLeft}>
                  <View style={styles.challengeAvatar}>
                    <Text style={styles.avatarText}>
                      {(c.creator?.name?.[0] ?? '?').toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.challengerName}>{c.creator?.name ?? 'Unknown'}</Text>
                    <Text style={styles.challengeMeta}>
                      {c.exam?.name} · {c.entryFee} coins
                    </Text>
                  </View>
                </View>
                <View style={styles.challengeActions}>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => doJoin(c._id)}
                    disabled={isDeclining}
                  >
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleDeclineChallenge(c._id)}
                    disabled={isDeclining}
                  >
                    {isDeclining
                      ? <ActivityIndicator size="small" color="#EF4444" />
                      : <CustomIcon name="close" size={16} color="#EF4444" />
                    }
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Battles" onBackPress={() => navigation.goBack()} />

      {/* Difficulty chips */}
      <View style={styles.chips}>
        {DIFFICULTY_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.chip, difficultyFilter === f.value && styles.chipActive]}
            onPress={() => setDifficultyFilter(f.value)}
          >
            <Text style={[styles.chipText, difficultyFilter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={battles}
          renderItem={renderBattle}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBattles(true)}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No open battles</Text>
              <Text style={styles.emptySub}>Create one or enter an invite code!</Text>
            </View>
          }
        />
      )}

      {/* Join by Code Modal */}
      <Modal
        visible={codeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCodeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !joiningByCode && setCodeModal(false)}
        >
          <View style={styles.codeModalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.codeModalTitle}>Enter Invite Code</Text>
            <Text style={styles.codeModalSub}>Ask the battle creator for their invite code</Text>
            <TextInput
              style={styles.codeInput}
              value={inviteCode}
              onChangeText={t => setInviteCode(t.toUpperCase())}
              placeholder="e.g. A3F8B2C1"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoFocus
              maxLength={8}
            />
            <TouchableOpacity
              style={[styles.codeJoinBtn, (!inviteCode.trim() || joiningByCode) && { opacity: 0.6 }]}
              onPress={handleJoinByCode}
              disabled={!inviteCode.trim() || joiningByCode}
            >
              {joiningByCode
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.codeJoinBtnText}>Join Battle</Text>
              }
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  chips: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: { backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: COLORS.primary },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    gap: 14,
  },

  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  creatorInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  creatorName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  examName: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },

  diffBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  diffText: { fontSize: 11, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statDivider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },

  joinBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  joinBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  empty: { paddingVertical: 48, alignItems: 'center', gap: 6 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF' },

  // Action row (Create + Code buttons)
  actionRow: { flexDirection: 'row', gap: 10 },
  createBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  codeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  codeBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // My active battles
  activeBattlesSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  activeSectionLabel: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 2 },
  activeBattleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activeStatusDot: { width: 8, height: 8, borderRadius: 4 },
  activeBattleName: { fontSize: 13, fontWeight: '600', color: '#111827' },
  activeBattleStatus: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  rejoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  rejoinBtnText: { fontSize: 12, fontWeight: '700' },

  // Pending challenges section
  challengesSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  challengeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  challengeAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengerName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  challengeMeta: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  challengeActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  acceptBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  declineBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Join by code modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  codeModalBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  codeModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  codeModalSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  codeInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 4,
    backgroundColor: '#F9FAFB',
  },
  codeJoinBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  codeJoinBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default BattleListScreen;

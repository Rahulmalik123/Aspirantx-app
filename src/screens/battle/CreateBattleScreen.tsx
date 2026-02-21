import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Share,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import battleService, { Battle } from '../../api/services/battleService';
import walletService from '../../api/services/walletService';
import practiceService from '../../api/services/practiceService';
import examService from '../../api/services/examService';
import { socialService } from '../../api/services/social.service';
import CustomIcon from '../../components/CustomIcon';

const DIFFICULTIES = [
  { value: 'easy'   as const, label: 'Easy',   color: '#10B981' },
  { value: 'medium' as const, label: 'Medium', color: '#F59E0B' },
  { value: 'hard'   as const, label: 'Hard',   color: '#EF4444' },
  { value: 'mixed'  as const, label: 'Mixed',  color: '#8B5CF6' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];
const PRESET_FEES = [10, 25, 50, 100, 200];
const PLATFORM_CUT = 0.10;

interface ExamItem { _id: string; name: string; examCode?: string; }
interface SubjectItem { _id: string; name: string; }
interface FollowUser { _id: string; name: string; profilePic?: string; }

const CreateBattleScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);

  const targetExamIds: string[] = (user?.targetExams ?? []).map((e: any) =>
    typeof e === 'string' ? e : e._id
  );
  const primaryExamId: string | undefined =
    user?.primaryExam
      ? typeof user.primaryExam === 'string'
        ? user.primaryExam
        : user.primaryExam._id
      : undefined;

  // State — battle settings
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [allExams, setAllExams] = useState<ExamItem[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [selectedExamId, setSelectedExamId] = useState<string | undefined>(primaryExamId);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [entryFee, setEntryFee] = useState('50');
  const [customFee, setCustomFee] = useState(false);
  const [loading, setLoading] = useState(false);

  // State — opponent selection modal
  const [opponentModal, setOpponentModal] = useState(false);
  // 'choose' | 'friends'
  const [opponentStep, setOpponentStep] = useState<'choose' | 'friends'>('choose');
  const [followingList, setFollowingList] = useState<FollowUser[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const fee = parseInt(entryFee, 10) || 0;
  const totalPool = fee * 2;
  const platformCut = Math.floor(totalPool * PLATFORM_CUT);
  const prizePool = totalPool - platformCut;
  const hasEnoughCoins = walletBalance !== null && walletBalance >= fee;

  useEffect(() => {
    walletService.getWallet()
      .then((data: any) => {
        const balance = data?.data?.balance ?? data?.balance ?? 0;
        setWalletBalance(balance);
      })
      .catch(() => setWalletBalance(0))
      .finally(() => setLoadingWallet(false));
  }, []);

  useEffect(() => {
    examService.getExams()
      .then((res: any) => {
        const list: ExamItem[] = res?.data?.data ?? res?.data ?? res ?? [];
        const arr = Array.isArray(list) ? list : [];
        const filtered = targetExamIds.length > 0
          ? arr.filter(e => targetExamIds.includes(e._id))
          : arr;
        setAllExams(filtered);
      })
      .catch(() => setAllExams([]))
      .finally(() => setLoadingExams(false));
  }, []);

  useEffect(() => {
    if (!selectedExamId) { setSubjects([]); return; }
    setLoadingSubjects(true);
    setSelectedSubjectId(null);
    practiceService.getSubjects(selectedExamId)
      .then((res: any) => {
        const list: SubjectItem[] = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? []);
        setSubjects(Array.isArray(list) ? list : []);
      })
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, [selectedExamId]);

  const validateSettings = (): boolean => {
    if (!selectedExamId) {
      Alert.alert('Select Exam', 'Please select an exam for the battle.');
      return false;
    }
    if (!selectedSubjectId) {
      Alert.alert('Select Subject', 'Please select a subject for the battle questions.');
      return false;
    }
    if (fee < 10 || fee > 1000) {
      Alert.alert('Invalid Amount', 'Entry fee must be between 10 and 1000 coins.');
      return false;
    }
    if (!hasEnoughCoins) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${fee} coins but have only ${walletBalance}. Please recharge your wallet.`
      );
      return false;
    }
    return true;
  };

  const openOpponentModal = () => {
    if (!validateSettings()) return;
    setOpponentStep('choose');
    setOpponentModal(true);
  };

  const loadFollowing = () => {
    if (!user?._id) return;
    setLoadingFollowing(true);
    socialService.getFollowing(user._id)
      .then((res: any) => {
        const list = res?.data?.data ?? res?.data ?? res ?? [];
        setFollowingList(Array.isArray(list) ? list : []);
      })
      .catch(() => setFollowingList([]))
      .finally(() => setLoadingFollowing(false));
  };

  const handleChooseFriend = () => {
    setOpponentStep('friends');
    loadFollowing();
  };

  const createBattleWith = async (inviteType: 'link' | 'direct', challengedUserId?: string) => {
    setLoading(true);
    try {
      const battle: Battle = await battleService.createBattle({
        examId: selectedExamId!,
        subjectId: selectedSubjectId!,
        entryFee: fee,
        totalQuestions: questionsCount,
        difficulty,
        inviteType,
        challengedUserId,
      });

      setOpponentModal(false);

      if (inviteType === 'link' && battle.inviteCode) {
        // Share the invite code + deep link
        const shareUrl = `https://aspirantx.com/battle/${battle._id}`;
        Share.share({
          message: `Challenge me to a battle on AspirantX! 🏆\n\nExam: ${allExams.find(e => e._id === selectedExamId)?.name}\nEntry Fee: ${fee} coins\nPrize: ${prizePool} coins\n\nJoin with code: ${battle.inviteCode}\nOr tap: ${shareUrl}`,
          url: shareUrl, // iOS ke liye
          title: 'Battle Challenge',
        }).catch(() => {});
      } else if (inviteType === 'direct') {
        // Notify user, then go to waiting room
        const challengedUser = followingList.find(u => u._id === challengedUserId);
        Alert.alert(
          'Challenge Sent!',
          `Battle challenge sent to ${challengedUser?.name || 'your friend'}. Waiting for them to accept...`
        );
      }

      // Creator goes to waiting room
      navigation.replace('LiveBattle', { battleId: battle._id });
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create battle');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFriend = (friend: FollowUser) => {
    Alert.alert(
      'Challenge Friend',
      `Send a battle challenge to ${friend.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Challenge', onPress: () => createBattleWith('direct', friend._id) },
      ]
    );
  };

  const canCreate = !!selectedExamId && !!selectedSubjectId && hasEnoughCoins && fee >= 10;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Battle</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Wallet Balance */}
        <View style={[styles.card, styles.walletCard]}>
          <View style={styles.walletRow}>
            <View style={styles.walletLeft}>
              <CustomIcon name="wallet-outline" size={18} color={COLORS.primary} />
              <Text style={styles.walletLabel}>Your Balance</Text>
            </View>
            {loadingWallet ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <View style={styles.walletRight}>
                <CustomIcon name="cash-outline" size={16} color="#F59E0B" />
                <Text style={styles.walletBalance}> {walletBalance ?? 0}</Text>
                <Text style={styles.walletUnit}> coins</Text>
              </View>
            )}
          </View>
          {!hasEnoughCoins && fee > 0 && walletBalance !== null && (
            <View style={styles.insufficientRow}>
              <CustomIcon name="warning-outline" size={13} color="#EF4444" />
              <Text style={styles.insufficientText}> Need {fee - walletBalance} more coins</Text>
            </View>
          )}
        </View>

        {/* Exam Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Exam</Text>
          <Text style={styles.sectionSub}>Select which exam to battle in</Text>
          {loadingExams ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
          ) : allExams.length === 0 ? (
            <Text style={styles.emptyNote}>No exams enrolled. Set your exams from Profile.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {allExams.map((exam) => {
                const isSelected = selectedExamId === exam._id;
                return (
                  <TouchableOpacity
                    key={exam._id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedExamId(exam._id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{exam.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Subject Selection */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <Text style={styles.sectionSub}>Questions will be picked from this subject</Text>
          {!selectedExamId ? (
            <Text style={styles.emptyNote}>Select an exam first.</Text>
          ) : loadingSubjects ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
          ) : subjects.length === 0 ? (
            <Text style={styles.emptyNote}>No subjects found for this exam.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {subjects.map((s) => {
                const isSelected = selectedSubjectId === s._id;
                return (
                  <TouchableOpacity
                    key={s._id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedSubjectId(s._id)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{s.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Entry Fee */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Entry Fee</Text>
          <Text style={styles.sectionSub}>Coins deducted from your wallet</Text>
          <View style={styles.feeChips}>
            {PRESET_FEES.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.feeChip, !customFee && fee === f && styles.feeChipActive]}
                onPress={() => { setEntryFee(String(f)); setCustomFee(false); }}
              >
                <Text style={[styles.feeChipText, !customFee && fee === f && styles.feeChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.feeChip, customFee && styles.feeChipActive]}
              onPress={() => setCustomFee(true)}
            >
              <Text style={[styles.feeChipText, customFee && styles.feeChipTextActive]}>Custom</Text>
            </TouchableOpacity>
          </View>
          {customFee && (
            <TextInput
              style={styles.feeInput}
              value={entryFee}
              onChangeText={setEntryFee}
              keyboardType="numeric"
              placeholder="Enter amount (10–1000)"
              placeholderTextColor="#9CA3AF"
              maxLength={4}
              autoFocus
            />
          )}
          {fee >= 10 && (
            <View style={styles.prizePreview}>
              <View style={styles.prizeRow}>
                <Text style={styles.prizeLabel}>Total Pool</Text>
                <View style={styles.prizeValueRow}>
                  <CustomIcon name="cash-outline" size={13} color="#F59E0B" />
                  <Text style={styles.prizeValue}> {totalPool}</Text>
                </View>
              </View>
              <View style={styles.prizeDivider} />
              <View style={styles.prizeRow}>
                <Text style={styles.prizeLabel}>Platform Fee (10%)</Text>
                <View style={styles.prizeValueRow}>
                  <CustomIcon name="cash-outline" size={13} color="#9CA3AF" />
                  <Text style={[styles.prizeValue, { color: '#6B7280' }]}> – {platformCut}</Text>
                </View>
              </View>
              <View style={styles.prizeDivider} />
              <View style={styles.prizeRow}>
                <Text style={[styles.prizeLabel, { fontWeight: '700', color: '#111827' }]}>Winner Gets</Text>
                <View style={styles.prizeValueRow}>
                  <CustomIcon name="cash-outline" size={13} color="#10B981" />
                  <Text style={[styles.prizeValue, { color: '#10B981', fontWeight: '700' }]}> {prizePool}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Difficulty */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <Text style={styles.sectionSub}>Choose question difficulty level</Text>
          <View style={styles.pillRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[styles.pill, difficulty === d.value && { backgroundColor: d.color + '18', borderColor: d.color }]}
                onPress={() => setDifficulty(d.value)}
              >
                <Text style={[styles.pillText, difficulty === d.value && { color: d.color, fontWeight: '700' }]}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Questions Count */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Questions</Text>
          <Text style={styles.sectionSub}>Number of questions per battle</Text>
          <View style={styles.pillRow}>
            {QUESTION_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.pill, questionsCount === count && { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary }]}
                onPress={() => setQuestionsCount(count)}
              >
                <Text style={[styles.pillText, questionsCount === count && { color: COLORS.primary, fontWeight: '700' }]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={[styles.card, styles.summaryCard]}>
          <Text style={styles.summaryTitle}>Battle Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Exam</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {allExams.find(e => e._id === selectedExamId)?.name ?? '—'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subject</Text>
              <Text style={styles.summaryValue} numberOfLines={1}>
                {subjects.find(s => s._id === selectedSubjectId)?.name ?? '—'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Difficulty</Text>
              <Text style={styles.summaryValue}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Prize Pool</Text>
              <View style={styles.prizeValueRow}>
                <CustomIcon name="cash-outline" size={14} color="#10B981" />
                <Text style={[styles.summaryValue, { color: '#10B981' }]}> {prizePool}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
          onPress={openOpponentModal}
          disabled={!canCreate}
        >
          <Text style={styles.createBtnText}>Choose Opponent</Text>
          <CustomIcon name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Opponent Selection Modal */}
      <Modal
        visible={opponentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOpponentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !loading && setOpponentModal(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>

            {/* Modal Header */}
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              {opponentStep === 'friends' && (
                <TouchableOpacity onPress={() => setOpponentStep('choose')} style={styles.modalBackBtn}>
                  <CustomIcon name="arrow-back" size={20} color="#111827" />
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                {opponentStep === 'choose' ? 'Choose Opponent' : 'Select a Friend'}
              </Text>
              <TouchableOpacity onPress={() => setOpponentModal(false)}>
                <CustomIcon name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {opponentStep === 'choose' ? (
              /* Option Cards */
              <View style={styles.optionList}>
                {/* Challenge a Friend */}
                <TouchableOpacity style={styles.optionCard} onPress={handleChooseFriend}>
                  <View style={[styles.optionIcon, { backgroundColor: '#EEF2FF' }]}>
                    <CustomIcon name="people-outline" size={26} color="#6366F1" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Challenge a Friend</Text>
                    <Text style={styles.optionSub}>Pick someone you follow. They'll get a notification.</Text>
                  </View>
                  <CustomIcon name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>

                {/* Share Invite Link */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={() => createBattleWith('link')}
                  disabled={loading}
                >
                  <View style={[styles.optionIcon, { backgroundColor: '#ECFDF5' }]}>
                    <CustomIcon name="share-social-outline" size={26} color="#10B981" />
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>Share Invite Link</Text>
                    <Text style={styles.optionSub}>Generate a code and share it with anyone.</Text>
                  </View>
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <CustomIcon name="chevron-forward" size={18} color="#D1D5DB" />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* Following List */
              <View style={styles.friendsList}>
                {loadingFollowing ? (
                  <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 32 }} />
                ) : followingList.length === 0 ? (
                  <View style={styles.emptyFriends}>
                    <CustomIcon name="people-outline" size={40} color="#D1D5DB" />
                    <Text style={styles.emptyFriendsText}>You're not following anyone yet.</Text>
                    <Text style={styles.emptyFriendsSub}>Follow other users to challenge them.</Text>
                  </View>
                ) : (
                  <FlatList
                    data={followingList}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.friendRow}
                        onPress={() => handleSelectFriend(item)}
                        disabled={loading}
                      >
                        <View style={styles.friendAvatar}>
                          {item.profilePic ? (
                            <Image source={{ uri: item.profilePic }} style={styles.avatarImg} />
                          ) : (
                            <Text style={styles.avatarInitial}>
                              {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.friendName}>{item.name}</Text>
                        <View style={styles.challengeBtn}>
                          <CustomIcon name="flash-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.challengeBtnText}> Challenge</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: 340 }}
                  />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

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
  backBtn: { width: 36, alignItems: 'flex-start' },
  backIcon: { fontSize: 28, color: '#111827', lineHeight: 32 },
  title: { fontSize: 17, fontWeight: '700', color: '#111827' },

  content: { padding: 16, gap: 12 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  sectionSub: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  emptyNote: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },

  walletCard: { borderWidth: 1, borderColor: COLORS.primary + '20' },
  walletRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  walletRight: { flexDirection: 'row', alignItems: 'center' },
  walletBalance: { fontSize: 20, fontWeight: '800', color: '#111827' },
  walletUnit: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  insufficientRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  insufficientText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },

  chipScroll: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: COLORS.primary },

  feeChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  feeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  feeChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  feeChipText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  feeChipTextActive: { color: COLORS.primary },
  feeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },

  prizePreview: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, gap: 8, marginTop: 4 },
  prizeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prizeValueRow: { flexDirection: 'row', alignItems: 'center' },
  prizeLabel: { fontSize: 13, color: '#6B7280' },
  prizeValue: { fontSize: 13, fontWeight: '600', color: '#111827' },
  prizeDivider: { height: 1, backgroundColor: '#E5E7EB' },

  pillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  pill: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  pillText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  summaryCard: { borderWidth: 1, borderColor: COLORS.primary + '20' },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  summaryItem: { width: '45%' },
  summaryLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  summaryValue: { fontSize: 15, fontWeight: '600', color: '#111827' },

  createBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  createBtnDisabled: { backgroundColor: '#9CA3AF' },
  createBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalBackBtn: { padding: 4 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827', flex: 1, textAlign: 'center' },

  optionList: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 14,
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  optionSub: { fontSize: 12, color: '#6B7280', lineHeight: 16 },

  // Friends list
  friendsList: { minHeight: 100 },
  emptyFriends: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyFriendsText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  emptyFriendsSub: { fontSize: 13, color: '#9CA3AF' },

  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  friendName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111827' },
  challengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '12',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  challengeBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});

export default CreateBattleScreen;

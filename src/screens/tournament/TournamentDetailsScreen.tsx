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
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';
import { 
  fetchTournamentDetails, 
  joinTournament,
  startTournamentTest 
} from '../../store/slices/tournamentSlice';
import tournamentService from '../../api/services/tournamentService';
import type { RootState, AppDispatch } from '../../store';

const TournamentDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { tournamentId } = route.params || {};
  const { activeTournament, loading } = useSelector((state: RootState) => state.tournament);
  const [canJoin, setCanJoin] = useState<{ canJoin: boolean; reason?: string }>({ canJoin: false });
  const [joining, setJoining] = useState(false);
  const [coinType, setCoinType] = useState<'paid' | 'free'>('paid');

  useEffect(() => {
    if (tournamentId) {
      loadTournamentDetails();
    }
  }, [tournamentId]);

  useEffect(() => {
    if (activeTournament && !activeTournament.isJoined) {
      checkCanJoin();
    }
  }, [activeTournament]);

  const loadTournamentDetails = () => {
    dispatch(fetchTournamentDetails(tournamentId));
  };

  const checkCanJoin = async () => {
    try {
      const result = await tournamentService.canJoinTournament(tournamentId);
      setCanJoin(result);
    } catch (error) {
      console.error('Error checking join eligibility:', error);
    }
  };

  const handleJoinTournament = async () => {
    if (!canJoin.canJoin) {
      Toast.show({
        type: 'error',
        text1: 'Cannot Join',
        text2: canJoin.reason || 'Unable to join tournament',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setJoining(true);
    try {
      const result = await dispatch(joinTournament({ tournamentId, coinType })).unwrap();
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: result.message || 'Successfully joined tournament',
        position: 'top',
        visibilityTime: 3000,
      });
      // Reload tournament details
      loadTournamentDetails();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error || 'Failed to join tournament',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setJoining(false);
    }
  };

  const handleStartTest = async () => {
    if (!activeTournament?.testId) return;

    try {
      const testData = await dispatch(startTournamentTest(activeTournament.testId)).unwrap();
      // Navigate to test screen with test data
      navigation.navigate('TournamentTest', {
        attemptId: testData.attemptId,
        questions: testData.questions,
        tournament: activeTournament,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to Start Test',
        text2: error || 'Unable to start tournament test',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  if (loading || !activeTournament) {
    return (
      <View style={styles.container}>
        <Header title="Tournament Details" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Header title="Tournament Details" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Banner Card */}
          <View style={[
            styles.bannerCard,
            activeTournament.status === 'live' && styles.liveBanner,
            activeTournament.status === 'completed' && styles.completedBanner,
          ]}>
            <Text style={styles.tournamentTitle}>{activeTournament.title || activeTournament.name}</Text>
            <View style={[
              styles.statusBadge,
              activeTournament.status === 'live' && styles.liveStatusBadge,
              activeTournament.status === 'upcoming' && styles.upcomingStatusBadge,
              activeTournament.status === 'completed' && styles.completedStatusBadge,
            ]}>
              <Text style={styles.statusText}>
                {activeTournament.status === 'live' ? '🔴 LIVE NOW' : activeTournament.status?.toUpperCase() || 'UPCOMING'}
              </Text>
            </View>
            {activeTournament.isJoined && (
              <View style={styles.joinedIndicator}>
                <Text style={styles.joinedIndicatorText}>✓ You are registered</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {activeTournament.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.description}>{activeTournament.description}</Text>
            </View>
          )}

          {/* Prize Pool */}
          <View style={styles.prizeCard}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
              <CustomIcon name="cash" type="ionicon" size={16} color="#92400E" />
              <Text style={styles.prizeLabel}>Prize Pool</Text>
            </View>
            <Text style={styles.prizeValue}>₹{activeTournament.prizePool.toLocaleString()}</Text>
            {(activeTournament.prizeDistribution || activeTournament.prizes) && 
             (activeTournament.prizeDistribution || activeTournament.prizes)!.length > 0 && (
              <Text style={styles.prizeSubtext}>
                Winner takes ₹{(activeTournament.prizeDistribution || activeTournament.prizes)![0].amount.toLocaleString()}
              </Text>
            )}
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <CustomIcon name="wallet" type="ionicon" size={20} color="COLORS.primary" />
              <Text style={styles.statValue}>₹{activeTournament.entryFee}</Text>
              <Text style={styles.statLabel}>Entry Fee</Text>
            </View>
            <View style={styles.statBox}>
              <CustomIcon name="people" type="ionicon" size={20} color="COLORS.primary" />
              <Text style={styles.statValue}>{activeTournament.currentParticipants || activeTournament.participants || 0}</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statBox}>
              <CustomIcon name={activeTournament.duration ? 'time' : 'help-circle'} type="ionicon" size={20} color="COLORS.primary" />
              <Text style={styles.statValue}>{activeTournament.duration || activeTournament.questions?.length || 0} {activeTournament.duration ? 'min' : 'Q'}</Text>
              <Text style={styles.statLabel}>{activeTournament.duration ? 'Duration' : 'Questions'}</Text>
            </View>
          </View>

          {/* Tournament Info */}
          <View style={styles.section}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12}}>
              <CustomIcon name="document-text" type="ionicon" size={18} color="#111827" />
              <Text style={styles.sectionTitle}>Tournament Details</Text>
            </View>
            <View style={styles.infoCard}>
              {activeTournament.totalQuestions && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Questions:</Text>
                  <Text style={styles.infoText}>{activeTournament.totalQuestions}</Text>
                </View>
              )}
              {activeTournament.totalMarks && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Marks:</Text>
                  <Text style={styles.infoText}>{activeTournament.totalMarks}</Text>
                </View>
              )}
              {activeTournament.startTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Start Time:</Text>
                  <Text style={styles.infoText}>{formatDate(activeTournament.startTime)}</Text>
                </View>
              )}
              {activeTournament.endTime && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>End Time:</Text>
                  <Text style={styles.infoText}>{formatDate(activeTournament.endTime)}</Text>
                </View>
              )}
              {activeTournament.type && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Type:</Text>
                  <Text style={styles.infoText}>{activeTournament.type.toUpperCase()}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Rules */}
          {activeTournament.rules && activeTournament.rules.length > 0 && (
            <View style={styles.section}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12}}>
                <CustomIcon name="shield-checkmark" type="ionicon" size={18} color="#111827" />
                <Text style={styles.sectionTitle}>Rules & Guidelines</Text>
              </View>
              <View style={styles.infoCard}>
                {activeTournament.rules.map((rule, index) => (
                  <Text key={index} style={styles.ruleText}>• {rule}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Prize Distribution */}
          {(activeTournament.prizeDistribution || activeTournament.prizes) && 
           (activeTournament.prizeDistribution || activeTournament.prizes)!.length > 0 && (
            <View style={styles.section}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12}}>
                <CustomIcon name="trophy" type="ionicon" size={18} color="#111827" />
                <Text style={styles.sectionTitle}>Prize Distribution</Text>
              </View>
              <View style={styles.prizeTable}>
                {(activeTournament.prizeDistribution || activeTournament.prizes)!.map((prize, index) => (
                  <View key={index} style={styles.prizeRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                      <CustomIcon 
                        name="medal" 
                        type="ionicon" 
                        size={18} 
                        color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#9CA3AF'} 
                      />
                      <Text style={styles.rankText}>{prize.rank}</Text>
                    </View>
                    <Text style={styles.amountText}>₹{prize.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Coin Type Selector (before join) */}
          {!activeTournament.isJoined && (activeTournament.status === 'upcoming' || activeTournament.status === 'live') && activeTournament.entryFee > 0 && (
            <View style={styles.coinTypeSection}>
              <Text style={styles.coinTypeSectionTitle}>Pay With</Text>
              <View style={styles.coinTypeRow}>
                <TouchableOpacity
                  style={[styles.coinTypeOption, coinType === 'paid' && styles.coinTypeOptionActive]}
                  onPress={() => setCoinType('paid')}
                >
                  <View style={[styles.coinTypeDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.coinTypeOptionText, coinType === 'paid' && { color: '#10B981', fontWeight: '700' }]}>Paid Coins</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.coinTypeOption, coinType === 'free' && styles.coinTypeOptionActiveFree]}
                  onPress={() => setCoinType('free')}
                >
                  <View style={[styles.coinTypeDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={[styles.coinTypeOptionText, coinType === 'free' && { color: '#92400E', fontWeight: '700' }]}>Free Coins</Text>
                </TouchableOpacity>
              </View>
              {coinType === 'free' && (
                <Text style={styles.coinTypeNote}>Free coin winnings cannot be withdrawn</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {!activeTournament.isJoined && (activeTournament.status === 'upcoming' || activeTournament.status === 'live') && (
            <TouchableOpacity
              style={[styles.joinButton, !canJoin.canJoin && styles.joinButtonDisabled]}
              onPress={handleJoinTournament}
              disabled={!canJoin.canJoin || joining}
            >
              {joining ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.joinButtonText}>
                  {canJoin.canJoin ? `Register with ${coinType === 'free' ? 'Free' : 'Paid'} Coins` : canJoin.reason || 'Cannot Join'}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {activeTournament.isJoined && activeTournament.status === 'live' && (
            <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <CustomIcon name="play-circle" type="ionicon" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>Start Test Now</Text>
              </View>
            </TouchableOpacity>
          )}

          {activeTournament.isJoined && activeTournament.status === 'upcoming' && (
            <View style={styles.waitingCard}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4}}>
                <CustomIcon name="time" type="ionicon" size={16} color="#92400E" />
                <Text style={styles.waitingText}>Tournament starts soon</Text>
              </View>
              <Text style={styles.waitingSubtext}>You'll be notified when it goes live</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.leaderboardButton}
            onPress={() => navigation.navigate('LiveLeaderboard', { tournamentId })}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <CustomIcon name="bar-chart" type="ionicon" size={20} color="COLORS.primary" />
              <Text style={styles.leaderboardButtonText}>View Leaderboard</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 12,
  },
  bannerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  liveBanner: {
    backgroundColor: '#DC2626',
  },
  completedBanner: {
    backgroundColor: '#6B7280',
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingStatusBadge: {
    backgroundColor: '#DBEAFE',
  },
  liveStatusBadge: {
    backgroundColor: '#FEE2E2',
  },
  completedStatusBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  joinedIndicator: {
    marginTop: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinedIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  descriptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  prizeCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  prizeLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 2,
  },
  prizeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  prizeSubtext: {
    fontSize: 11,
    color: '#92400E',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoText: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  ruleText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  prizeTable: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  startButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  waitingCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  waitingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  waitingSubtext: {
    fontSize: 12,
    color: '#92400E',
  },
  leaderboardButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  leaderboardButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  coinTypeSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  coinTypeSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  coinTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coinTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  coinTypeOptionActive: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  coinTypeOptionActiveFree: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  coinTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  coinTypeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  coinTypeNote: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default TournamentDetailsScreen;

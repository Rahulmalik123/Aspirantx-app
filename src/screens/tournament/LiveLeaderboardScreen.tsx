import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import { fetchTournamentLeaderboard } from '../../store/slices/tournamentSlice';
import type { RootState, AppDispatch } from '../../store';
import type { TournamentLeaderboardEntry } from '../../types/tournament.types';

const LiveLeaderboardScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { tournamentId } = route.params || {};
  const { leaderboard, loading, pagination } = useSelector((state: RootState) => state.tournament);
  
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (tournamentId) {
      loadLeaderboard();
      
      // Auto-refresh every 30 seconds for live updates
      const interval = setInterval(() => {
        loadLeaderboard(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [tournamentId, page]);

  const loadLeaderboard = (showLoading = true) => {
    if (!showLoading) setRefreshing(true);
    
    dispatch(fetchTournamentLeaderboard({ 
      tournamentId,
      filters: { page, limit: 50 }
    })).finally(() => {
      setRefreshing(false);
    });
  };

  const handleRefresh = () => {
    setPage(1);
    loadLeaderboard();
  };

  const loadMore = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.firstPlace;
    if (rank === 2) return styles.secondPlace;
    if (rank === 3) return styles.thirdPlace;
    return {};
  };

  const renderLeaderboardItem = ({ item }: { item: TournamentLeaderboardEntry }) => (
    <View style={[styles.leaderboardItem, getRankStyle(item.rank)]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, item.rank <= 3 && styles.topRankText]}>
          {getRankEmoji(item.rank)}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.userName}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            ✓ {item.correctAnswers} • ✗ {item.incorrectAnswers} • {item.accuracy.toFixed(1)}%
          </Text>
          <Text style={styles.timeText}>
            ⏱ {Math.floor(item.timeTaken / 60)}m {item.timeTaken % 60}s
          </Text>
        </View>
      </View>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>{item.score}</Text>
        <Text style={styles.scoreLabel}>pts</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Live Leaderboard" 
        onBackPress={() => navigation.goBack()} 
      />

      {loading && page === 1 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <Text style={styles.autoRefreshText}>
              🔄 Auto-refreshes every 30 seconds
            </Text>
            <Text style={styles.totalParticipants}>
              Total Participants: {pagination.total}
            </Text>
          </View>

          <FlatList
            data={leaderboard}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item, index) => `${item.userId}-${item.rank}-${index}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No participants yet</Text>
                <Text style={styles.emptySubtext}>Rankings will appear once the tournament starts</Text>
              </View>
            }
            ListFooterComponent={
              loading && page > 1 ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.footer} />
              ) : null
            }
          />
        </>
      )}
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
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  autoRefreshText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  totalParticipants: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firstPlace: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  secondPlace: {
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#9CA3AF',
  },
  thirdPlace: {
    backgroundColor: '#FED7AA',
    borderWidth: 2,
    borderColor: '#EA580C',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  topRankText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  stats: {
    gap: 2,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  footer: {
    paddingVertical: 20,
  },
});

export default LiveLeaderboardScreen;

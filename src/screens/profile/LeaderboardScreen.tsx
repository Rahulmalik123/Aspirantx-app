import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import userService, { LeaderboardUser } from '../../api/services/userService';
import Header from '../../components/common/Header';

const LeaderboardScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<'global' | 'friends'>('global');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedTab]);

  const fetchLeaderboard = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      const response: any = await userService.getLeaderboard({
        page: refresh ? 1 : page,
        limit: 20,
        type: selectedTab,
      });

      const leaderboardList = response?.data?.data || response?.data || [];
      const currentUserData = response?.data?.currentUser || null;
      const paginationData = response?.data?.pagination || {};

      setLeaderboardData(leaderboardList);
      setCurrentUser(currentUserData);
      setHasMore(paginationData.hasNextPage !== false);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const response: any = await userService.getLeaderboard({
        page: nextPage,
        limit: 20,
        type: selectedTab,
      });

      const leaderboardList = response?.data?.data || response?.data || [];
      const paginationData = response?.data?.pagination || {};

      if (leaderboardList && leaderboardList.length > 0) {
        setLeaderboardData([...leaderboardData, ...leaderboardList]);
        setPage(nextPage);
        setHasMore(paginationData.hasNextPage !== false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return { color: '#F59E0B', bg: '#FEF3C7' };
    if (rank === 2) return { color: '#9CA3AF', bg: '#F3F4F6' };
    if (rank === 3) return { color: '#D97706', bg: '#FEF3C7' };
    return null;
  };

  const renderTopThree = () => {
    const top3 = leaderboardData.filter(u => u.rank <= 3);
    if (top3.length === 0) return null;

    // Reorder: 2nd, 1st, 3rd
    const ordered = [
      top3.find(u => u.rank === 2),
      top3.find(u => u.rank === 1),
      top3.find(u => u.rank === 3),
    ].filter(Boolean) as LeaderboardUser[];

    return (
      <View style={styles.podiumContainer}>
        {ordered.map((user) => {
          const isFirst = user.rank === 1;
          return (
            <View key={user._id} style={[styles.podiumItem, isFirst && styles.podiumItemFirst]}>
              <View style={[styles.podiumAvatarWrap, isFirst && styles.podiumAvatarWrapFirst]}>
                {isFirst && (
                  <View style={styles.crownWrap}>
                    <Text style={styles.crownEmoji}>👑</Text>
                  </View>
                )}
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={[styles.podiumAvatar, isFirst && styles.podiumAvatarFirst]} />
                ) : (
                  <View style={[styles.podiumAvatarFallback, isFirst && styles.podiumAvatarFirst]}>
                    <Text style={[styles.podiumAvatarText, isFirst && { fontSize: 16 }]}>{user.name.charAt(0).toUpperCase()}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.podiumName, isFirst && styles.podiumNameFirst]} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.podiumXP}>{user.experience || 0} XP</Text>
              <View style={[styles.podiumRankBadge, { backgroundColor: getRankIcon(user.rank)?.bg }]}>
                <Text style={[styles.podiumRankText, { color: getRankIcon(user.rank)?.color }]}>#{user.rank}</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => {
    if (item.rank <= 3) return null; // Top 3 shown in podium

    return (
      <View style={styles.listItem}>
        <Text style={styles.listRank}>{item.rank}</Text>

        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
        ) : (
          <View style={styles.listAvatarFallback}>
            <Text style={styles.listAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.listInfo}>
          <Text style={styles.listName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.listMeta}>Lv {item.level || 1}</Text>
        </View>

        <View style={styles.listRight}>
          {item.currentStreak > 0 && (
            <View style={styles.streakPill}>
              <Icon name="flame" size={10} color="#FF6B35" />
              <Text style={styles.streakNum}>{item.currentStreak}</Text>
            </View>
          )}
          <Text style={styles.listXP}>{item.experience || 0} XP</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Leaderboard" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Leaderboard" onBackPress={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'global' && styles.tabActive]}
          onPress={() => setSelectedTab('global')}
        >
          <Text style={[styles.tabLabel, selectedTab === 'global' && styles.tabLabelActive]}>Global</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'friends' && styles.tabActive]}
          onPress={() => setSelectedTab('friends')}
        >
          <Text style={[styles.tabLabel, selectedTab === 'friends' && styles.tabLabelActive]}>Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Current User Strip */}
      {currentUser && (
        <View style={styles.myRankStrip}>
          <Text style={styles.myRankLabel}>Your Rank</Text>
          <View style={styles.myRankRight}>
            <Text style={styles.myRankValue}>#{currentUser.rank || '-'}</Text>
            <View style={styles.myRankDot} />
            <Text style={styles.myRankXP}>{currentUser.experience || 0} XP</Text>
          </View>
        </View>
      )}

      {/* Top 3 Podium */}
      {renderTopThree()}

      {/* Rest of list */}
      <FlatList
        data={leaderboardData}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderLeaderboardItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchLeaderboard(true)} colors={[COLORS.primary]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="trophy-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No data yet</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && leaderboardData.length > 0 ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: 16 }} />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Tabs ---
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: COLORS.white,
  },

  // --- My Rank Strip ---
  myRankStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.primary + '0A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  myRankLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  myRankRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  myRankValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  myRankDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
  },
  myRankXP: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  // --- Podium ---
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  podiumItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  podiumItemFirst: {
    paddingVertical: 18,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  podiumAvatarWrap: {
    marginBottom: 8,
    position: 'relative',
  },
  podiumAvatarWrapFirst: {
    marginBottom: 10,
  },
  crownWrap: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    zIndex: 1,
    left: '50%',
    marginLeft: -8,
  },
  crownEmoji: {
    fontSize: 16,
  },
  podiumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  podiumAvatarFirst: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  podiumAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  podiumAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
    maxWidth: 80,
    textAlign: 'center',
  },
  podiumNameFirst: {
    fontSize: 12,
    fontWeight: '700',
  },
  podiumXP: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 6,
  },
  podiumRankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  podiumRankText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // --- List Items ---
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  listRank: {
    width: 24,
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  listAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
  },
  listAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  listAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listInfo: {
    flex: 1,
    marginLeft: 10,
  },
  listName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  listMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 1,
  },
  listRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streakNum: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B35',
  },
  listXP: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  // --- Empty ---
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 13,
    color: '#9CA3AF',
  },
});

export default LeaderboardScreen;

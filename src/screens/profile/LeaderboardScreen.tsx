import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
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
        type: 'global',
      });

      console.log('📊 Leaderboard response:', response);

      // Response structure: { success, message, data: { data, currentUser, pagination } }
      const leaderboardList = response?.data?.data || response?.data || [];
      const currentUserData = response?.data?.currentUser || null;
      const paginationData = response?.data?.pagination || {};

      if (refresh) {
        setLeaderboardData(leaderboardList);
      } else {
        setLeaderboardData(leaderboardList);
      }

      setCurrentUser(currentUserData);
      setHasMore(paginationData.hasNextPage !== false);
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
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
        type: 'global',
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
      console.error('❌ Failed to load more:', error);
    }
  };

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return COLORS.primary;
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankContainer}>
        {item.rank <= 3 ? (
          <View style={[styles.crownBadge, { backgroundColor: getRankBadgeColor(item.rank) + '20' }]}>
            <Icon name="trophy" size={20} color={getRankBadgeColor(item.rank)} />
          </View>
        ) : (
          <View style={styles.rankNumber}>
            <Text style={styles.rankText}>{item.rank}</Text>
          </View>
        )}
      </View>

      <View style={styles.userAvatar}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.levelBadge}>Lv {item.level || 1}</Text>
          <Text style={styles.points}>{item.experience || 0} XP</Text>
        </View>
      </View>

      {item.currentStreak > 0 && (
        <View style={styles.streakBadge}>
          <Icon name="flame" size={14} color="#FF6B35" />
          <Text style={styles.streakText}>{item.currentStreak}</Text>
        </View>
      )}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Header title="Leaderboard" onBackPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Leaderboard" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity>
            <Icon name="filter-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'global' && styles.tabActive]}
          onPress={() => setSelectedTab('global')}
        >
          <Icon name="globe-outline" size={20} color={selectedTab === 'global' ? COLORS.white : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'global' && styles.tabTextActive]}>
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'friends' && styles.tabActive]}
          onPress={() => setSelectedTab('friends')}
          disabled
        >
          <Icon name="people-outline" size={20} color={selectedTab === 'friends' ? COLORS.white : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'friends' && styles.tabTextActive]}>
            Friends (Soon)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Current User Position */}
      {currentUser ? (
        <View style={styles.currentUserCard}>
          <View style={styles.currentUserLeft}>
            <Text style={styles.currentUserRank}>#{currentUser.rank || '?'}</Text>
            <View style={styles.userAvatar}>
              {currentUser.avatar ? (
                <Image source={{ uri: currentUser.avatar }} style={styles.avatarImageSmall} />
              ) : (
                <View style={styles.avatarPlaceholderSmall}>
                  <Text style={styles.avatarTextSmall}>{currentUser.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.currentUserName}>You</Text>
              <Text style={styles.currentUserPoints}>Lv {currentUser.level || 1} · {currentUser.experience || 0} XP</Text>
            </View>
          </View>
          <View style={styles.currentUserRight}>
            <Text style={styles.levelBadgeLarge}>Lv {currentUser.level || 1}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>Start practicing to appear on the leaderboard!</Text>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderLeaderboardItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="trophy-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && leaderboardData.length > 0 ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    gap: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  currentUserCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  currentUserLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  currentUserRight: {
    marginLeft: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  currentUserRank: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    minWidth: 40,
  },
  currentUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentUserPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  levelBadgeLarge: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 10,
  },
  crownBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  userAvatar: {
    marginRight: 10,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarTextSmall: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  points: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  levelBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF4ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default LeaderboardScreen;

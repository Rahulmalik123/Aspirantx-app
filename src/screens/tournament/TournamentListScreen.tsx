import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import { fetchTournaments, setTournamentFilters } from '../../store/slices/tournamentSlice';
import type { RootState, AppDispatch } from '../../store';
import type { Tournament } from '../../types/tournament.types';

const TournamentListScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  
  const { tournaments, loading, error, pagination, filters } = useSelector(
    (state: RootState) => state.tournament
  );
  
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'live' | 'completed'>('upcoming');

  useEffect(() => {
    loadTournaments();
  }, [activeFilter]);

  const loadTournaments = () => {
    dispatch(fetchTournaments({ 
      status: activeFilter,
      page: 1,
      limit: 20 
    }));
  };

  const handleRefresh = () => {
    loadTournaments();
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TournamentDetails', { tournamentId: item._id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title || item.name}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'live' && styles.liveBadge,
          item.status === 'upcoming' && styles.upcomingBadge,
          item.status === 'completed' && styles.completedBadge,
        ]}>
          <Text style={styles.statusText}>{item.status?.toUpperCase() || 'UPCOMING'}</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      )}

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Prize Pool</Text>
          <Text style={styles.infoValue}>₹{item.prizePool.toLocaleString()}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Entry Fee</Text>
          <Text style={styles.infoValue}>₹{item.entryFee}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Participants</Text>
          <Text style={styles.infoValue}>{item.currentParticipants || item.participants || 0}/{item.maxParticipants || 0}</Text>
        </View>
      </View>

      {item.isJoined && (
        <View style={styles.joinedBadge}>
          <Text style={styles.joinedText}>✓ Joined</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Tournaments" onBackPress={() => navigation.goBack()} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'upcoming' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('upcoming')}
        >
          <Text style={[styles.filterText, activeFilter === 'upcoming' && styles.activeFilterText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'live' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('live')}
        >
          <Text style={[styles.filterText, activeFilter === 'live' && styles.activeFilterText]}>
            Live
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterTab, activeFilter === 'completed' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('completed')}
        >
          <Text style={[styles.filterText, activeFilter === 'completed' && styles.activeFilterText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <Text style={styles.emptyText}>No {activeFilter} tournaments</Text>
                <Text style={styles.emptySubtext}>Check back later for new tournaments</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterText: {
    color: COLORS.white,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  upcomingBadge: {
    backgroundColor: '#DBEAFE',
  },
  liveBadge: {
    backgroundColor: '#FEE2E2',
  },
  completedBadge: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  joinedBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  empty: {
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
});

export default TournamentListScreen;

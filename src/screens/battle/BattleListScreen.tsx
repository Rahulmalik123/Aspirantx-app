import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface Battle {
  _id: string;
  creator: { name: string };
  difficulty: 'easy' | 'medium' | 'hard';
  questions: number;
  betAmount: number;
  status: 'waiting' | 'live' | 'completed';
}

const BattleListScreen = () => {
  const navigation = useNavigation<any>();
  const [battles, setBattles] = useState<Battle[]>([
    {
      _id: '1',
      creator: { name: 'Rahul Kumar' },
      difficulty: 'medium',
      questions: 10,
      betAmount: 50,
      status: 'waiting',
    },
  ]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleJoinBattle = (battleId: string) => {
    navigation.navigate('LiveBattle', { battleId });
  };

  const renderBattle = ({ item }: { item: Battle }) => (
    <View style={styles.battleCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.creatorName}>{item.creator.name}</Text>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(item.difficulty) + '20' }
        ]}>
          <Text style={[
            styles.difficultyText,
            { color: getDifficultyColor(item.difficulty) }
          ]}>
            {item.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.battleInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Questions</Text>
          <Text style={styles.infoValue}>{item.questions}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Bet Amount</Text>
          <Text style={styles.infoValue}>🪙 {item.betAmount}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinBattle(item._id)}
      >
        <Text style={styles.joinButtonText}>Join Battle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Available Battles" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={battles}
        renderItem={renderBattle}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateBattle')}
          >
            <Text style={styles.createButtonText}>+ Create New Battle</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No battles available</Text>
            <Text style={styles.emptySubtext}>Be the first to create one!</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  list: {
    padding: 20,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  battleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  battleInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  joinButton: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default BattleListScreen;

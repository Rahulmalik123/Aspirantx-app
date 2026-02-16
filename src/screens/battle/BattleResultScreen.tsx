import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const BattleResultScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { myScore = 5, opponentScore = 3, isWinner = true } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Battle Result</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[
            styles.resultBanner,
            { backgroundColor: isWinner ? '#D1FAE5' : '#FEE2E2' }
          ]}>
            <Text style={styles.resultEmoji}>
              {isWinner ? '🎉' : '😔'}
            </Text>
            <Text style={[
              styles.resultText,
              { color: isWinner ? '#065F46' : '#991B1B' }
            ]}>
              {isWinner ? 'You Won!' : 'You Lost!'}
            </Text>
          </View>

          <View style={styles.scoreComparison}>
            <View style={styles.playerScoreBox}>
              <Text style={styles.scoreBoxLabel}>Your Score</Text>
              <Text style={[
                styles.scoreBoxValue,
                { color: isWinner ? '#10B981' : '#6B7280' }
              ]}>
                {myScore}
              </Text>
            </View>

            <View style={styles.vsCircle}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            <View style={styles.playerScoreBox}>
              <Text style={styles.scoreBoxLabel}>Opponent</Text>
              <Text style={[
                styles.scoreBoxValue,
                { color: !isWinner ? '#EF4444' : '#6B7280' }
              ]}>
                {opponentScore}
              </Text>
            </View>
          </View>

          <View style={styles.rewardCard}>
            <Text style={styles.rewardLabel}>
              {isWinner ? 'Coins Won' : 'Coins Lost'}
            </Text>
            <Text style={[
              styles.rewardValue,
              { color: isWinner ? '#10B981' : '#EF4444' }
            ]}>
              {isWinner ? '+' : '-'}🪙 50
            </Text>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Performance Breakdown</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{myScore}</Text>
                <Text style={styles.statLabel}>Correct</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{10 - myScore}</Text>
                <Text style={styles.statLabel}>Wrong</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{(myScore / 10 * 100).toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={() => navigation.navigate('BattleList')}
          >
            <Text style={styles.playAgainButtonText}>Play Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  closeIcon: {
    fontSize: 40,
    color: '#111827',
    fontWeight: '300',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  resultBanner: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  resultText: {
    fontSize: 28,
    fontWeight: '700',
  },
  scoreComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerScoreBox: {
    flex: 1,
    alignItems: 'center',
  },
  scoreBoxLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  scoreBoxValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  vsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  rewardCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  rewardValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  playAgainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  playAgainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  homeButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
});

export default BattleResultScreen;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface CoinTask {
  id: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  color: string;
  completed?: boolean;
}

const EarnCoinsScreen = () => {
  const navigation = useNavigation<any>();

  // No free daily tasks - coins are purchase-only
  const dailyTasks: CoinTask[] = [];

  // No free weekly tasks - coins are purchase-only
  const weeklyTasks: CoinTask[] = [];

  // No free bonus tasks - coins are purchase-only
  const bonusTasks: CoinTask[] = [];

  const renderTaskSection = (title: string, tasks: CoinTask[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {tasks.map((task) => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskCard, task.completed && styles.taskCardCompleted]}
          activeOpacity={0.7}
        >
          <View style={[styles.taskIcon, { backgroundColor: task.color + '20' }]}>
            <Icon name={task.icon} size={24} color={task.color} />
          </View>
          
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
              {task.title}
            </Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>

          <View style={styles.rewardContainer}>
            <View style={[styles.coinBadge, task.completed && styles.coinBadgeCompleted]}>
              <Icon name="logo-bitcoin" size={16} color={task.completed ? '#10B981' : COLORS.primary} />
              <Text style={[styles.rewardText, task.completed && styles.rewardTextCompleted]}>
                +{task.reward}
              </Text>
            </View>
            {task.completed && (
              <Icon name="checkmark-circle" size={24} color="#10B981" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Coin Wallet" onBackPress={() => navigation.goBack()} />

      {/* Current Balance */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceLeft}>
          <Icon name="wallet" size={32} color={COLORS.primary} />
          <View>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={styles.balanceAmount}>2,450 Coins</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.historyButton}>
          <Icon name="time-outline" size={20} color={COLORS.primary} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderTaskSection('Daily Tasks', dailyTasks)}
        {renderTaskSection('Weekly Challenges', weeklyTasks)}
        {renderTaskSection('Bonus Opportunities', bonusTasks)}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Purchase coins to unlock premium content, participate in tournaments, and access exclusive features. Visit the Wallet section to buy coin packages!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  placeholder: {
    width: 40,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  taskDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  rewardContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary + '15',
    borderRadius: 12,
  },
  coinBadgeCompleted: {
    backgroundColor: '#10B981' + '15',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rewardTextCompleted: {
    color: '#10B981',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 20,
  },
});

export default EarnCoinsScreen;

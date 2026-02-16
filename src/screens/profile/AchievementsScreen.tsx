import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  total?: number;
  color: string;
}

const AchievementsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  const achievements: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Complete your first quiz', icon: 'footsteps', unlocked: true, unlockedAt: '2024-01-15', color: '#10B981' },
    { id: '2', title: 'Speed Demon', description: 'Complete 10 quizzes in a day', icon: 'flash', unlocked: true, unlockedAt: '2024-01-18', color: '#F59E0B' },
    { id: '3', title: 'Perfect Score', description: 'Get 100% in any quiz', icon: 'star', unlocked: true, unlockedAt: '2024-01-20', color: '#FFD700' },
    { id: '4', title: 'Consistent', description: 'Maintain a 7-day streak', icon: 'calendar', unlocked: false, progress: 5, total: 7, color: '#3B82F6' },
    { id: '5', title: 'Century', description: 'Solve 100 questions', icon: 'checkmark-circle', unlocked: false, progress: 67, total: 100, color: '#9C27B0' },
    { id: '6', title: 'Master', description: 'Score above 90% in 5 subjects', icon: 'school', unlocked: false, progress: 2, total: 5, color: '#EC4899' },
    { id: '7', title: 'Night Owl', description: 'Complete a quiz after midnight', icon: 'moon', unlocked: true, unlockedAt: '2024-01-19', color: '#6366F1' },
    { id: '8', title: 'Early Bird', description: 'Complete a quiz before 6 AM', icon: 'sunny', unlocked: false, progress: 0, total: 1, color: '#F97316' },
    { id: '9', title: 'Social Butterfly', description: 'Refer 5 friends', icon: 'people', unlocked: false, progress: 2, total: 5, color: '#14B8A6' },
    { id: '10', title: 'Champion', description: 'Rank in top 10', icon: 'trophy', unlocked: false, progress: 0, total: 1, color: '#FFD700' },
  ];

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedTab === 'unlocked') return achievement.unlocked;
    if (selectedTab === 'locked') return !achievement.unlocked;
    return true;
  });

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    points: achievements.filter(a => a.unlocked).length * 10,
  };

  return (
    <View style={styles.container}>
      <Header title="Achievements" onBackPress={() => navigation.goBack()} />

      {/* Stats Banner */}
      <View style={styles.statsBanner}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.unlocked}/{stats.total}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.points}</Text>
          <Text style={styles.statLabel}>Points Earned</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round((stats.unlocked / stats.total) * 100)}%</Text>
          <Text style={styles.statLabel}>Completion</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'unlocked' && styles.tabActive]}
          onPress={() => setSelectedTab('unlocked')}
        >
          <Text style={[styles.tabText, selectedTab === 'unlocked' && styles.tabTextActive]}>
            Unlocked
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'locked' && styles.tabActive]}
          onPress={() => setSelectedTab('locked')}
        >
          <Text style={[styles.tabText, selectedTab === 'locked' && styles.tabTextActive]}>
            Locked
          </Text>
        </TouchableOpacity>
      </View>

      {/* Achievements List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.achievementsList}>
          {filteredAchievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                !achievement.unlocked && styles.achievementCardLocked,
              ]}
            >
              <View style={[
                styles.achievementIcon,
                { backgroundColor: achievement.unlocked ? achievement.color + '20' : '#E5E7EB' }
              ]}>
                <Icon
                  name={achievement.icon}
                  size={32}
                  color={achievement.unlocked ? achievement.color : '#9CA3AF'}
                />
              </View>
              
              <View style={styles.achievementContent}>
                <View style={styles.achievementHeader}>
                  <Text style={[
                    styles.achievementTitle,
                    !achievement.unlocked && styles.achievementTitleLocked,
                  ]}>
                    {achievement.title}
                  </Text>
                  {achievement.unlocked && (
                    <Icon name="checkmark-circle" size={20} color={achievement.color} />
                  )}
                </View>
                
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                
                {achievement.unlocked ? (
                  <Text style={styles.unlockedDate}>
                    Unlocked on {new Date(achievement.unlockedAt!).toLocaleDateString()}
                  </Text>
                ) : achievement.progress !== undefined && achievement.total !== undefined ? (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${(achievement.progress / achievement.total) * 100}%`, backgroundColor: achievement.color }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {achievement.progress}/{achievement.total}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          ))}
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
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
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
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
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
  scrollContent: {
    padding: 20,
  },
  achievementsList: {
    gap: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  unlockedDate: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 50,
    textAlign: 'right',
  },
});

export default AchievementsScreen;

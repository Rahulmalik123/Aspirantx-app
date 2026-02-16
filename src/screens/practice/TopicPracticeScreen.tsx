import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface Topic {
  _id: string;
  name: string;
  subject: string;
  totalQuestions: number;
  completed: number;
  accuracy: number;
}

const TopicPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId } = route.params || {};
  const [topics, setTopics] = useState<Topic[]>([
    {
      _id: '1',
      name: 'Number System',
      subject: 'Mathematics',
      totalQuestions: 150,
      completed: 75,
      accuracy: 85,
    },
    {
      _id: '2',
      name: 'Algebra',
      subject: 'Mathematics',
      totalQuestions: 200,
      completed: 50,
      accuracy: 72,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleTopicSelect = (topic: Topic) => {
    navigation.navigate('DailyPractice', { topicId: topic._id, examId });
  };

  const renderTopic = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={styles.topicCard}
      onPress={() => handleTopicSelect(item)}
    >
      <View style={styles.topicHeader}>
        <Text style={styles.topicName}>{item.name}</Text>
        <Text style={styles.topicSubject}>{item.subject}</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(item.completed / item.totalQuestions) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {item.completed}/{item.totalQuestions} questions
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[
            styles.statValue,
            { color: item.accuracy >= 75 ? '#10B981' : '#F59E0B' }
          ]}>
            {item.accuracy}%
          </Text>
        </View>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Practice →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Topic-wise Practice" onBackPress={() => navigation.goBack()} />

      <FlatList
        data={topics}
        renderItem={renderTopic}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No topics available</Text>
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
  topicCard: {
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
  topicHeader: {
    marginBottom: 12,
  },
  topicName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  topicSubject: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 6,
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default TopicPracticeScreen;

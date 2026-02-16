import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import testService from '../../api/services/testService';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

interface TestHistoryItem {
  attemptId: string;
  testId: {
    _id: string;
    title: string;
    type: string;
    totalMarks: number;
  };
  status: 'completed' | 'in_progress';
  marksObtained: number;
  percentage: number;
  rank?: number;
  submittedAt: string;
}

const TestHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // For "all", don't send status parameter, backend will return everything
      const status = filter === 'all' ? undefined : filter;
      console.log('📜 [TestHistory] Fetching with filter:', filter, 'status param:', status);
      const response = await testService.getTestHistory(status);
      console.log('📜 [TestHistory] Full Response:', JSON.stringify(response, null, 2));
      
      // Handle different response structures
      const historyData = response?.data?.data || response?.data || response || [];
      console.log('📜 [TestHistory] History Data:', historyData);
      console.log('📜 [TestHistory] Total items:', historyData.length);
      
      setHistory(historyData);
    } catch (error) {
      console.error('❌ [TestHistory] Error:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mock_test: 'Mock',
      subject_test: 'Subject',
      topic_test: 'Topic',
      daily_quiz: 'Quiz',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? '#10B981' : '#F59E0B';
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const renderItem = ({ item }: { item: TestHistoryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to TestDetails which has options for View Result and View Solutions
        navigation.navigate('TestDetails', {
          testId: item.testId._id,
        });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {item.testId.title}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: COLORS.primary + '15' }]}>
            <Text style={[styles.typeText, { color: COLORS.primary }]}>
              {getTypeLabel(item.testId.type)}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(item.submittedAt)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {item.marksObtained}/{item.testId.totalMarks}
          </Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>
            {item.percentage.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Accuracy</Text>
        </View>

        {item.rank && (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#FFD700' }]}>
              #{item.rank}
            </Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        )}

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'completed' ? 'Done' : 'Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <CustomIcon name="document-text-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyText}>No test history found</Text>
      <Text style={styles.emptySubtext}>Complete tests to see your history</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Test History" showBackButton onBackPress={() => navigation.goBack()} />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'completed', 'in_progress'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={(item) => item.attemptId}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={history.length === 0 ? styles.emptyList : styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    padding: 16,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  card: {
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
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TestHistoryScreen;

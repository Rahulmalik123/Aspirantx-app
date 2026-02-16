import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import practiceService from '../../api/services/practiceService';
import Header from '../../components/common/Header';

interface WeakConcept {
  conceptId: string;
  conceptName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

const WeakConceptPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [weakConcepts, setWeakConcepts] = useState<WeakConcept[]>([]);

  const fetchWeakConcepts = async () => {
    setLoading(true);
    try {
      const data = await practiceService.getWeakConcepts(20);
      setWeakConcepts(data || []);
    } catch (error) {
      console.error('Failed to fetch weak concepts:', error);
      Alert.alert('Error', 'Failed to load weak concepts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeakConcepts();
  }, []);

  const handleConceptPress = (concept: WeakConcept) => {
    navigation.navigate('ConceptPractice', {
      conceptId: concept.conceptId,
      conceptName: concept.conceptName,
    });
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 40) return '#EF4444';
    if (accuracy < 60) return '#F59E0B';
    return '#10B981';
  };

  const getAccuracyBg = (accuracy: number) => {
    if (accuracy < 40) return '#FEE2E2';
    if (accuracy < 60) return '#FEF3C7';
    return '#D1FAE5';
  };

  const renderConceptItem = ({ item, index }: { item: WeakConcept; index: number }) => (
    <TouchableOpacity
      style={styles.conceptCard}
      onPress={() => handleConceptPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.conceptLeft}>
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor:
                index < 3
                  ? index === 0
                    ? '#FEE2E2'
                    : index === 1
                    ? '#FEF3C7'
                    : '#DBEAFE'
                  : '#F3F4F6',
            },
          ]}
        >
          <Text
            style={[
              styles.rankText,
              {
                color:
                  index < 3
                    ? index === 0
                      ? '#EF4444'
                      : index === 1
                      ? '#F59E0B'
                      : '#3B82F6'
                    : '#6B7280',
              },
            ]}
          >
            #{index + 1}
          </Text>
        </View>
        <View style={styles.conceptInfo}>
          <Text style={styles.conceptName} numberOfLines={2}>
            {item.conceptName}
          </Text>
          <Text style={styles.conceptAttempts}>
            {item.totalAttempts} attempts • {item.correctAttempts} correct
          </Text>
        </View>
      </View>
      <View style={styles.conceptRight}>
        <View
          style={[
            styles.accuracyBadge,
            { backgroundColor: getAccuracyBg(item.accuracy) },
          ]}
        >
          <Text
            style={[
              styles.accuracyText,
              { color: getAccuracyColor(item.accuracy) },
            ]}
          >
            {item.accuracy.toFixed(0)}%
          </Text>
        </View>
        <CustomIcon name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Weak Concepts" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={fetchWeakConcepts}>
            <CustomIcon name="refresh" size={24} color="#6B7280" />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing your performance...</Text>
        </View>
      ) : weakConcepts.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>Great Job!</Text>
          <Text style={styles.emptyText}>
            You don't have any weak concepts yet.{'\n'}
            Keep practicing to maintain your performance!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyButtonText}>Back to Practice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={weakConcepts}
          renderItem={renderConceptItem}
          keyExtractor={(item) => item.conceptId}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.headerInfo}>
              <CustomIcon name="information-circle" size={20} color={COLORS.primary} />
              <Text style={styles.headerInfoText}>
                Focus on these concepts to improve your overall performance.
                Concepts with accuracy below 60% are shown here.
              </Text>
            </View>
          }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  listContent: {
    padding: 20,
  },
  headerInfo: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  headerInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  conceptCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  conceptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  conceptInfo: {
    flex: 1,
  },
  conceptName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  conceptAttempts: {
    fontSize: 12,
    color: '#6B7280',
  },
  conceptRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  accuracyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  accuracyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default WeakConceptPracticeScreen;

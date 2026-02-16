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
import examService from '../../api/services/examService';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

interface Exam {
  _id: string;
  name: string;
  examCode: string;
  fullName?: string;
  categoryName?: string;
  level?: string;
  frequency?: string;
  mode?: string;
  eligibility?: {
    ageLimit?: {
      min: number;
      max: number;
    };
    qualification?: string;
    nationality?: string;
  };
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

const ExamListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categoryId, categoryName } = route.params || {};
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [categoryId]);

  const fetchExams = async () => {
    try {
      // If no categoryId, fetch all exams
      const data = categoryId 
        ? await examService.getExamsByCategory(categoryId)
        : await examService.getExams();
      setExams(data.data || data || []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderExam = ({ item }: { item: Exam }) => (
    <TouchableOpacity
      style={styles.examCard}
      onPress={() => navigation.navigate('ExamDetails', { examId: item._id })}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <CustomIcon name="document-text" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.examName}>{item.name}</Text>
        {item.fullName && (
          <Text style={styles.fullName} numberOfLines={1}>
            {item.fullName}
          </Text>
        )}
        <View style={styles.infoRow}>
          {item.eligibility?.qualification && (
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>{item.eligibility.qualification}</Text>
            </View>
          )}
          {item.mode && (
            <View style={styles.infoBadge}>
              <Text style={styles.infoText}>{item.mode.charAt(0).toUpperCase() + item.mode.slice(1)}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={categoryName || 'All Exams'} onBackPress={() => navigation.goBack()} />

      <FlatList
        data={exams}
        renderItem={renderExam}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 20,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examIcon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 24,
    color: '#D1D5DB',
    marginLeft: 8,
  },
});

export default ExamListScreen;

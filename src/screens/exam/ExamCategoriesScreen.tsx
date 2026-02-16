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
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import examService from '../../api/services/examService';
import CustomIcon from '../../components/CustomIcon';
import { RootState } from '../../store';

interface ExamCategory {
  _id: string;
  name: string;
  icon: string;
  examCount: number;
  description: string;
}

const ExamCategoriesScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await examService.getCategories();
      const allCategories = data.data || [];
      
      console.log('👤 [ExamCategories] User data:', user);
      
      // Handle nested user data structure (user.data.user or user.user or user)
      const userData = user?.data?.user || user?.user || user;
      console.log('👤 [ExamCategories] Extracted user data:', userData);
      console.log('📚 [ExamCategories] Primary exam:', userData?.primaryExam);
      console.log('📚 [ExamCategories] Target exams:', userData?.targetExams);
      
      // Get all user's exam IDs (from primaryExam and targetExams)
      const userExamIds: string[] = [];
      if (userData?.primaryExam) {
        userExamIds.push(userData.primaryExam);
      }
      if (userData?.targetExams && Array.isArray(userData.targetExams)) {
        userExamIds.push(...userData.targetExams);
      }
      
      // Remove duplicates
      const uniqueExamIds = [...new Set(userExamIds)];
      console.log('🎯 [ExamCategories] User exam IDs:', uniqueExamIds);
      
      // Filter categories based on user's exams
      if (uniqueExamIds.length > 0) {
        try {
          // Fetch details for all user's exams
          const examDetailsPromises = uniqueExamIds.map(examId => 
            examService.getExamDetails(examId)
          );
          const allExamDetails = await Promise.all(examDetailsPromises);
          console.log('📋 [ExamCategories] All exam details:', allExamDetails);
          
          // Extract unique category IDs from all exams
          const userCategoryIds = new Set<string>();
          allExamDetails.forEach(examDetails => {
            const categoryId = examDetails.data?.categoryId || examDetails.categoryId;
            if (categoryId) {
              userCategoryIds.add(categoryId);
            }
          });
          
          console.log('📂 [ExamCategories] User category IDs:', Array.from(userCategoryIds));
          console.log('📂 [ExamCategories] All categories:', allCategories);
          
          // Filter to show only categories that match user's exams
          if (userCategoryIds.size > 0) {
            const filteredCategories = allCategories.filter(
              (cat: ExamCategory) => userCategoryIds.has(cat._id)
            );
            console.log('✅ [ExamCategories] Filtered categories:', filteredCategories);
            setCategories(filteredCategories);
          } else {
            console.log('⚠️ [ExamCategories] No category IDs found, showing all');
            setCategories(allCategories);
          }
        } catch (error) {
          console.error('❌ [ExamCategories] Failed to fetch exam details:', error);
          // If error, show all categories as fallback
          setCategories(allCategories);
        }
      } else {
        console.log('⚠️ [ExamCategories] No exams selected, showing all categories');
        // If no exams selected, show all categories
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('❌ [ExamCategories] Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategory = ({ item }: { item: ExamCategory }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ExamList', { categoryId: item._id, categoryName: item.name })}
    >
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{item.icon || '📚'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.examCount}>{item.examCount} exams</Text>
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
      {/* Minimal Header */}
      <View style={styles.minimalHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CustomIcon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mock Tests</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  minimalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 32, // Same width as back button to keep title centered
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  list: {
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  examCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  arrow: {
    fontSize: 24,
    color: '#D1D5DB',
  },
});

export default ExamCategoriesScreen;

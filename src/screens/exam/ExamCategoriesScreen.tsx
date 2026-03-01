import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../../constants/colors';
import examService from '../../api/services/examService';
import CustomIcon from '../../components/CustomIcon';
import { RootState } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;

// Color palette for category cards
const CARD_COLORS = [
  { bg: '#EEF2FF', accent: '#4F46E5', light: '#C7D2FE' }, // Indigo
  { bg: '#FEF3C7', accent: '#D97706', light: '#FDE68A' }, // Amber
  { bg: '#ECFDF5', accent: '#059669', light: '#A7F3D0' }, // Emerald
  { bg: '#FEE2E2', accent: '#DC2626', light: '#FECACA' }, // Red
  { bg: '#F3E8FF', accent: '#7C3AED', light: '#DDD6FE' }, // Violet
  { bg: '#E0F2FE', accent: '#0284C7', light: '#BAE6FD' }, // Sky
  { bg: '#FCE7F3', accent: '#DB2777', light: '#FBCFE8' }, // Pink
  { bg: '#FFF7ED', accent: '#EA580C', light: '#FED7AA' }, // Orange
  { bg: '#F0FDF4', accent: '#16A34A', light: '#BBF7D0' }, // Green
  { bg: '#EFF6FF', accent: '#2563EB', light: '#BFDBFE' }, // Blue
];

// Map category names to vector icons
const CATEGORY_ICONS: Record<string, { name: string; type?: 'ionicon' | 'material' | 'material-community' | 'font-awesome5' | 'feather' }> = {
  'ssc': { name: 'file-document-outline', type: 'material-community' },
  'railway': { name: 'train-variant', type: 'material-community' },
  'banking': { name: 'bank', type: 'material-community' },
  'defense': { name: 'shield-outline', type: 'material-community' },
  'teaching': { name: 'school-outline', type: 'material-community' },
  'police': { name: 'shield-star-outline', type: 'material-community' },
  'state': { name: 'map-marker-outline', type: 'material-community' },
  'upsc': { name: 'domain', type: 'material-community' },
  'engineering': { name: 'cog-outline', type: 'material-community' },
  'medical': { name: 'medical-bag', type: 'material-community' },
  'law': { name: 'scale-balance', type: 'material-community' },
  'management': { name: 'chart-line', type: 'material-community' },
  'haryana': { name: 'map-marker-outline', type: 'material-community' },
  'insurance': { name: 'shield-check-outline', type: 'material-community' },
  'agriculture': { name: 'sprout-outline', type: 'material-community' },
  'science': { name: 'flask-outline', type: 'material-community' },
};

const getCategoryIcon = (name: string): { name: string; type?: any } => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return { name: 'book-open-outline', type: 'material-community' };
};

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
      // Handle both string IDs and populated objects {_id, name, ...}
      const extractId = (exam: any): string | null => {
        if (!exam) return null;
        if (typeof exam === 'string') return exam;
        if (typeof exam === 'object' && exam._id) return exam._id;
        return null;
      };

      const userExamIds: string[] = [];
      const primaryId = extractId(userData?.primaryExam);
      if (primaryId) {
        userExamIds.push(primaryId);
      }
      if (userData?.targetExams && Array.isArray(userData.targetExams)) {
        userData.targetExams.forEach((exam: any) => {
          const id = extractId(exam);
          if (id) userExamIds.push(id);
        });
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

  const renderCategory = ({ item, index }: { item: ExamCategory; index: number }) => {
    const colorScheme = CARD_COLORS[index % CARD_COLORS.length];
    const iconConfig = getCategoryIcon(item.name);
    return (
      <TouchableOpacity
        style={[styles.categoryCard, { backgroundColor: colorScheme.bg }]}
        onPress={() => navigation.navigate('ExamList', { categoryId: item._id, categoryName: item.name })}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: colorScheme.light }]}>
          <CustomIcon name={iconConfig.name} size={24} color={colorScheme.accent} type={iconConfig.type} />
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
        <View style={[styles.examCountBadge, { backgroundColor: colorScheme.light }]}>
          <Text style={[styles.examCountText, { color: colorScheme.accent }]}>
            {item.examCount} {item.examCount === 1 ? 'exam' : 'exams'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <CustomIcon name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Mock Tests</Text>
          <Text style={styles.headerSubtitle}>Choose a category to start</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  headerSpacer: {
    width: 32,
  },
  list: {
    padding: HORIZONTAL_PADDING,
    paddingTop: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  examCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  examCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default ExamCategoriesScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import CustomIcon from '../../components/CustomIcon';
import Header from '../../components/common/Header';
import practiceService from '../../api/services/practiceService';

interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  totalTopics: number;
  totalQuestions: number;
  progress?: number;
  isActive: boolean;
  displayOrder: number;
}

const SubjectPracticeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId } = route.params || {};
  const { user } = useSelector((state: RootState) => state.auth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Icon mapping for emoji to Ionicon conversion
  const getIconName = (emoji?: string, subjectName?: string): string => {
    // Map emojis to Ionicon names
    const emojiToIconMap: { [key: string]: string } = {
      '🔢': 'calculator-outline',
      '🧠': 'bulb-outline',
      '🌍': 'globe-outline',
      '📝': 'create-outline',
      '💡': 'bulb-outline',
      '💻': 'laptop-outline',
      '🔬': 'flask-outline',
      '📐': 'calculator-outline',
      '📰': 'newspaper-outline',
      '🇮🇳': 'language-outline',
    };

    // If emoji is provided, convert it to icon name
    if (emoji && emojiToIconMap[emoji]) {
      return emojiToIconMap[emoji];
    }

    // Fallback: map based on subject name
    if (subjectName) {
      const name = subjectName.toLowerCase();
      if (name.includes('math') || name.includes('quantitative')) return 'calculator-outline';
      if (name.includes('reason') || name.includes('logic') || name.includes('intelligence')) return 'bulb-outline';
      if (name.includes('english') || name.includes('language')) return 'create-outline';
      if (name.includes('general') || name.includes('awareness') || name.includes('gk')) return 'globe-outline';
      if (name.includes('computer') || name.includes('it')) return 'laptop-outline';
      if (name.includes('science')) return 'flask-outline';
      if (name.includes('current') || name.includes('affairs')) return 'newspaper-outline';
      if (name.includes('hindi')) return 'language-outline';
    }

    return 'book-outline'; // default icon
  };

  const fetchSubjects = async () => {
    try {
      const examIdToUse = examId || user?.primaryExam;
      const response = await practiceService.getSubjects(examIdToUse);
      const subjectsData = Array.isArray(response) 
        ? response 
        : (response?.data?.data || response?.data || []);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

  const handleSubjectSelect = (subject: Subject) => {
    navigation.navigate('TopicPractice', { subjectId: subject._id, examId });
  };

  const renderSubject = ({ item }: { item: Subject }) => {
    const iconName = getIconName(item.icon, item.name);
    const progress = item.progress || 0;

    return (
      <TouchableOpacity
        style={styles.subjectCard}
        onPress={() => handleSubjectSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          <CustomIcon name={iconName} size={24} color={COLORS.primary} />
        </View>

        <View style={styles.subjectContent}>
          <Text style={styles.subjectName}>{item.name}</Text>
          
          {progress > 0 && (
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
          )}

          <View style={styles.statsRow}>
            <Text style={styles.questionsText}>
              {item.totalQuestions} questions
            </Text>
            <Text style={styles.topicsText}>
              {item.totalTopics} topics
            </Text>
          </View>
        </View>

        <CustomIcon name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Subject-wise Practice" onBackPress={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : subjects.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No subjects available</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          renderItem={renderSubject}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  list: {
    padding: 16,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectContent: {
    flex: 1,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  topicsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default SubjectPracticeScreen;

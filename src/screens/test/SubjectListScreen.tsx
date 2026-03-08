import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import subjectService from '../../api/services/subjectService';
import { Subject } from '../../types/subject.types';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

// Accent colors for icon containers only (cards stay white)
const ACCENT_COLORS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Violet
  '#0284C7', // Sky
  '#DB2777', // Pink
  '#EA580C', // Orange
  '#16A34A', // Green
  '#2563EB', // Blue
];

// Light tints for icon backgrounds
const ACCENT_TINTS = [
  '#EEF2FF',
  '#ECFDF5',
  '#FEF3C7',
  '#FEE2E2',
  '#F3E8FF',
  '#E0F2FE',
  '#FCE7F3',
  '#FFF7ED',
  '#F0FDF4',
  '#EFF6FF',
];

// Subject-specific icon mapping
const SUBJECT_ICONS: Record<string, string> = {
  math: 'calculator-outline',
  ganit: 'calculator-outline',
  science: 'flask-outline',
  vigyan: 'flask-outline',
  english: 'language-outline',
  hindi: 'text-outline',
  history: 'time-outline',
  itihas: 'time-outline',
  geography: 'earth-outline',
  bhugol: 'earth-outline',
  polity: 'flag-outline',
  rajniti: 'flag-outline',
  economics: 'trending-up-outline',
  arthshastra: 'trending-up-outline',
  reasoning: 'bulb-outline',
  tarkshakti: 'bulb-outline',
  general: 'book-outline',
  samanya: 'book-outline',
  computer: 'desktop-outline',
  current: 'newspaper-outline',
  physics: 'planet-outline',
  chemistry: 'beaker-outline',
  biology: 'leaf-outline',
  environment: 'globe-outline',
  paryavaran: 'globe-outline',
};

const getSubjectIcon = (name: string): string => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'book-outline';
};

const SubjectListScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { examId, examName } = route.params || {};

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, [examId]);

  useEffect(() => {
    filterSubjects();
  }, [searchQuery, subjects]);

  const fetchSubjects = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      const response = await subjectService.getSubjects(examId);
      setSubjects(response.data || []);
    } catch (error: any) {
      console.error('[SubjectList] Error fetching subjects:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects(true);
  };

  const filterSubjects = () => {
    if (!searchQuery.trim()) {
      setFilteredSubjects(subjects);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.code.toLowerCase().includes(query) ||
        subject.description?.toLowerCase().includes(query)
    );
    setFilteredSubjects(filtered);
  };

  const handleSubjectPress = (subject: Subject) => {
    navigation.navigate(ROUTES.TEST_LIST, {
      examId,
      examName,
      subjectId: subject._id,
      subjectName: subject.name,
      type: 'subject_test',
    });
  };

  const handleViewTopics = (subject: Subject) => {
    navigation.navigate(ROUTES.TOPIC_SELECTION, {
      subjectId: subject._id,
      subjectName: subject.name,
      examId,
      examName,
    });
  };

  const renderSubjectCard = ({ item, index }: { item: Subject; index: number }) => {
    const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
    const tint = ACCENT_TINTS[index % ACCENT_TINTS.length];
    const iconName = getSubjectIcon(item.name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSubjectPress(item)}
        activeOpacity={0.6}
      >
        {/* Left: Colored Icon */}
        <View style={[styles.iconBox, { backgroundColor: tint }]}>
          <CustomIcon name={iconName} size={22} color={accent} />
        </View>

        {/* Middle: Info */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{item.totalQuestions} Questions</Text>
            <View style={styles.metaDot} />
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleViewTopics(item);
              }}
            >
              <Text style={[styles.metaText, { color: accent }]}>
                {item.totalTopics} Topics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right: Arrow */}
        <CustomIcon name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <CustomIcon name="book-outline" size={36} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No Subjects Found</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? 'No subjects match your search'
          : 'No subjects available for this exam'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title={`${examName} - Subjects`}
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={`${examName} - Subjects`}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <CustomIcon name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <CustomIcon name="close-circle" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          )}
        </View>

        {/* Subject Count */}
        {filteredSubjects.length > 0 && (
          <Text style={styles.sectionLabel}>
            {filteredSubjects.length}{' '}
            {filteredSubjects.length === 1 ? 'Subject' : 'Subjects'}
          </Text>
        )}

        {/* Subjects List */}
        <FlatList
          data={filteredSubjects}
          keyExtractor={(item) => item._id}
          renderItem={renderSubjectCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Poppins-Regular',
    paddingVertical: 0,
  },

  // Section
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },

  // List
  listContent: {
    paddingBottom: 24,
  },

  // Card - White, clean, minimal
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Poppins-Regular',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

export default SubjectListScreen;

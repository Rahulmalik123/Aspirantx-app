import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  FlatList,
  Alert,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import userService, { DashboardStats } from '../../api/services/userService';
import examService from '../../api/services/examService';
import bannerService, { Banner } from '../../api/services/bannerService';
import contentService, { Content } from '../../api/services/contentService';
import testService, { TestAttempt } from '../../api/services/testService';
import { setUser } from '../../store/slices/authSlice';
import CustomIcon from '../../components/CustomIcon';
import Header from '../../components/common/Header';

const { width } = Dimensions.get('window');

interface Exam {
  _id: string;
  name: string;
  examCode: string;
  category: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [marketplaceContent, setMarketplaceContent] = useState<Content[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [loadingRecentTests, setLoadingRecentTests] = useState(false);

  // Default fallback banners if backend doesn't return any
  const defaultBanners = [
    {
      _id: 'default-1',
      title: 'Master Your Exam',
      description: 'Practice Daily & Excel',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'default-2',
      title: 'Track Progress',
      description: 'Analyze & Improve',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'default-3',
      title: 'Join Tournaments',
      description: 'Compete & Win',
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ] as Banner[];

  // Category data
  const categories = [
    { id: 1, name: 'Daily Practice', icon: 'book-outline', color: 'COLORS.primary', screen: 'DailyPractice', params: undefined },
    { id: 2, name: 'Mock Tests', icon: 'create-outline', color: '#8B5CF6', screen: 'ExamCategories', params: undefined },
    // PYQ/Previous Papers - Temporarily Commented Out
    // { id: 3, name: 'Previous Papers', icon: 'document-text-outline', color: '#EC4899', screen: 'PYQScreen', params: undefined },
    { id: 4, name: 'Tournaments', icon: 'trophy-outline', color: '#F59E0B', screen: 'TournamentList', params: undefined },
    { id: 7, name: 'Battles', icon: 'flash-outline', color: '#EF4444', screen: 'BattleList', params: undefined },
    { id: 5, name: 'Analytics', icon: 'stats-chart-outline', color: '#10B981', screen: 'Analytics', params: undefined },
    { id: 6, name: 'Saved Content', icon: 'bookmark-outline', color: '#06B6D4', screen: 'SavedContent', params: undefined },
  ];

  const fetchBanners = async () => {
    try {
      const fetchedBanners = await bannerService.getActiveBanners();
      if (fetchedBanners && fetchedBanners.length > 0) {
        setBanners(fetchedBanners);
      } else {
        // Use default banners if no banners from backend
        setBanners(defaultBanners);
      }
    } catch (error) {
      console.error('❌ [Home] Failed to fetch banners:', error);
      setBanners(defaultBanners);
    } finally {
      setLoadingBanners(false);
    }
  };

  const fetchMarketplaceContent = async () => {
    setLoadingContent(true);
    try {
      const response = await contentService.getContents({
        page: 1,
        limit: 10,
      });
      // Response structure: { data: { data: [...], pagination: {...} } }
      const contentData = (response as any)?.data?.data || (response as any)?.data || [];
      setMarketplaceContent(contentData);
    } catch (error) {
      console.error('❌ [Home] Failed to fetch marketplace content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchRecentTests = async () => {
    setLoadingRecentTests(true);
    try {
      const response = await testService.getTestHistory('completed');
      // Get max 4 recent tests - handle nested data structure
      const testsData = (response as any)?.data?.data || (response as any)?.data || [];
      setRecentTests(testsData.slice(0, 4));
    } catch (error) {
      console.error('❌ [Home] Failed to fetch recent tests:', error);
    } finally {
      setLoadingRecentTests(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (error) {
      console.error('❌ [Home] Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response: any = await examService.getExams();
      const allExams: Exam[] = response?.data?.data ?? response?.data ?? response ?? [];
      setExams(Array.isArray(allExams) ? allExams : []);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleExamChange = async () => {
    if (selectedExams.length === 0) return;

    try {
      const updatedUser = await userService.updateProfile({
        primaryExam: selectedExams[0], // First selected exam as primary
        targetExams: selectedExams,
      });
      
      dispatch(setUser(updatedUser));
      setShowExamModal(false);
      Alert.alert('Success', 'Exam updated successfully!');
      fetchDashboard(); // Refresh dashboard
    } catch (error) {
      console.error('Failed to update exam:', error);
      Alert.alert('Error', 'Failed to update exam. Please try again.');
    }
  };

  const openExamModal = () => {
    console.log('🔍 [Home] Opening exam modal...');
    // Extract exam IDs from targetExams (which can be objects or strings)
    const currentTargetExams = user?.targetExams?.map((exam: any) => 
      typeof exam === 'string' ? exam : exam._id
    ) || (user?.primaryExam ? [typeof user.primaryExam === 'string' ? user.primaryExam : user.primaryExam._id] : []);
    setSelectedExams(currentTargetExams);
    setShowExamModal(true);
    console.log('🔍 [Home] Modal state set to true, selected exams:', currentTargetExams);
    if (exams.length === 0) {
      console.log('🔍 [Home] Fetching exams...');
      fetchExams();
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchBanners();
    fetchMarketplaceContent();
    fetchRecentTests();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setLoadingBanners(true);
    fetchDashboard();
    fetchBanners();
    fetchMarketplaceContent();
    fetchRecentTests();
  };

  const handleBannerPress = async (banner: Banner) => {
    // Track banner click
    await bannerService.trackBannerClick(banner._id);

    // Navigate based on link type
    if (banner.linkType === 'practice') {
      navigation.navigate('DailyPractice');
    } else if (banner.linkType === 'exam' && banner.linkId) {
      navigation.navigate('ExamDetail', { examId: banner.linkId });
    } else if (banner.linkType === 'tournament' && banner.linkId) {
      navigation.navigate('TournamentDetail', { tournamentId: banner.linkId });
    } else if (banner.linkType === 'external' && banner.linkUrl) {
      Linking.openURL(banner.linkUrl).catch(() => {});
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const userStats = stats?.stats || user?.stats || {};


  // Get selected exam name
  const selectedExamData = exams.find(exam => exam._id === user?.primaryExam);
  const selectedExamName = selectedExamData?.name || selectedExamData?.examCode;

  return (
    <View style={styles.container}>
      <Header
        title="Home"
        showBackButton={false}
        isHomeHeader={true}
        showExamSelector={true}
        selectedExamName={selectedExamName}
        onExamSelectorPress={openExamModal}
        backgroundColor="#F9FAFB"
        rightComponent={
          <TouchableOpacity 
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <View>
              <CustomIcon name="notifications-outline" size={24} color={COLORS.textPrimary} />
              <View style={styles.notificationBadge} />
            </View>
          </TouchableOpacity>
        }
      />
      <ScrollView 
      contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          {loadingBanners ? (
            <View style={styles.bannerLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const slideIndex = Math.round(
                    event.nativeEvent.contentOffset.x / (width * 0.9 + 10)
                  );
                  setActiveSlide(slideIndex);
                }}
                scrollEventThrottle={16}
                ref={scrollViewRef}
                contentContainerStyle={{ paddingHorizontal: 5 }}
              >
                {banners.map((banner, index) => (
                  <TouchableOpacity
                    key={banner._id}
                    style={styles.bannerSlide}
                    activeOpacity={0.9}
                    onPress={() => handleBannerPress(banner)}
                  >
                    <View style={styles.banner}>
                      {banner.imageUrl ? (
                        <>
                          <Image
                            source={{ uri: banner.imageUrl }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                          />
                          <View style={styles.bannerOverlay} />
                        </>
                      ) : (
                        <View
                          style={[
                            styles.bannerFallback,
                            {
                              backgroundColor:
                                index === 0
                                  ? COLORS.primary
                                  : index === 1
                                  ? COLORS.secondary
                                  : COLORS.accent,
                            },
                          ]}
                        />
                      )}
                      <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{banner.title}</Text>
                        {banner.description && (
                          <Text style={styles.bannerSubtitle}>{banner.description}</Text>
                        )}
                      </View>
                      {!banner.imageUrl && (
                        <View style={styles.bannerStats}>
                          <View style={styles.bannerStatItem}>
                            <Text style={styles.bannerStatValue}>
                              {userStats.totalQuestions || 0}
                            </Text>
                            <Text style={styles.bannerStatLabel}>Solved</Text>
                          </View>
                          <View style={styles.bannerStatDivider} />
                          <View style={styles.bannerStatItem}>
                            <Text style={styles.bannerStatValue}>
                              {userStats.accuracy || 0}%
                            </Text>
                            <Text style={styles.bannerStatLabel}>Accuracy</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Pagination Dots */}
              <View style={styles.paginationContainer}>
                {banners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      activeSlide === index && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Service Category */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => {
                  if (category.screen) {
                    try {
                      navigation.navigate(category.screen, category.params);
                    } catch (error) {
                      console.log('Navigation error:', error);
                      Alert.alert('Coming Soon', 'This feature will be available soon!');
                    }
                  }
                }}
              >
                <View style={[styles.categoryIconBox, { backgroundColor: category.color + '15' }]}>
                  <CustomIcon name={category.icon} size={24} color={category.color} />
                </View>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Tests Section */}
        {recentTests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Tests</Text>
              <TouchableOpacity onPress={() => {
                if (user?.primaryExam) {
                  const examId = typeof user.primaryExam === 'string' ? user.primaryExam : user.primaryExam._id;
                  const examName = typeof user.primaryExam === 'string' ? 'Tests' : user.primaryExam.name || 'Tests';
                  navigation.navigate('TestList', { 
                    examId: examId,
                    examName: examName
                  });
                } else {
                  navigation.navigate('ExamCategories');
                }
              }}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {loadingRecentTests ? (
              <View style={styles.recentTestsLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentTestsScrollContent}
              >
                {recentTests.map((testHistory) => {
                  const test = testHistory.testId || {};
                  const percentage = testHistory.percentage || 0;
                  const marksObtained = testHistory.marksObtained || 0;
                  const totalMarks = testHistory.totalMarks || 0;
                  const timeSpent = testHistory.timeSpent || testHistory.totalTimeTaken || 0;
                  const accuracy = testHistory.accuracy || 0;
                  const rank = testHistory.rank || null;
                  const correctAnswers = testHistory.correctAnswers || 0;
                  const wrongAnswers = testHistory.wrongAnswers || 0;
                  const skippedQuestions = testHistory.skippedQuestions || 0;
                  const totalQuestions = testHistory.totalQuestions || 0;
                  const examName = test.examId?.name || test.examName || 'N/A';
                  const testType = test.type || 'test';
                  const completedDate = new Date(testHistory.createdAt || testHistory.updatedAt);
                  const formattedDate = completedDate.toLocaleDateString('en-IN', { 
                    day: 'numeric', 
                    month: 'short' 
                  });

                  // Get test type label
                  const getTestTypeLabel = (type: string) => {
                    switch(type) {
                      case 'subject_test': return 'Subject';
                      case 'mock_test': return 'Mock';
                      case 'topic_test': return 'Topic';
                      case 'daily_quiz': return 'Quiz';
                      case 'pyq': return 'PYQ';
                      default: return 'Test';
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={testHistory._id}
                      style={styles.recentTestCard}
                      activeOpacity={0.9}
                      onPress={() => navigation.navigate('TestResult', { 
                        attemptId: testHistory._id 
                      })}
                    >
                      {/* Left Side - Score & Info */}
                      <View style={[
                        styles.recentTestLeftSection,
                        { backgroundColor: percentage >= 75 ? COLORS.secondary : percentage >= 50 ? COLORS.accent : COLORS.primary }
                      ]}>
                        <Text style={styles.recentTestPercentage}>{percentage.toFixed(0)}%</Text>
                        <Text style={styles.recentTestScoreLabel}>Score</Text>
                        <View style={styles.recentTestScoreFraction}>
                          <Text style={styles.recentTestScoreFractionText}>{marksObtained}/{totalMarks}</Text>
                        </View>
                        {rank && (
                          <View style={styles.recentTestRankBadge}>
                            <CustomIcon name="trophy" size={12} color="#FFF" />
                            <Text style={styles.recentTestRankText}>#{rank}</Text>
                          </View>
                        )}
                      </View>

                      {/* Right Side - Details */}
                      <View style={styles.recentTestRightSection}>
                        <View style={styles.recentTestTopRow}>
                          <View style={styles.recentTestTypeBadge}>
                            <Text style={styles.recentTestTypeText}>{getTestTypeLabel(testType)}</Text>
                          </View>
                          <Text style={styles.recentTestDate}>{formattedDate}</Text>
                        </View>

                        <Text style={styles.recentTestTitle} numberOfLines={2}>
                          {(test.title || 'Test').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Text>

                        <Text style={styles.recentTestExam} numberOfLines={1}>
                          {examName}
                        </Text>

                        <View style={styles.recentTestMetricsRow}>
                          <View style={styles.recentTestMetricItem}>
                            <CustomIcon name="checkmark-circle" size={14} color={COLORS.success} />
                            <Text style={styles.recentTestMetricText}>{correctAnswers}</Text>
                          </View>
                          <View style={styles.recentTestMetricItem}>
                            <CustomIcon name="close-circle" size={14} color={COLORS.error} />
                            <Text style={styles.recentTestMetricText}>{wrongAnswers}</Text>
                          </View>
                          <View style={styles.recentTestMetricItem}>
                            <CustomIcon name="remove-circle" size={14} color={COLORS.warning} />
                            <Text style={styles.recentTestMetricText}>{skippedQuestions}</Text>
                          </View>
                          <View style={styles.recentTestDividerVertical} />
                          <View style={styles.recentTestMetricItem}>
                            <CustomIcon name="time" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.recentTestMetricText}>{Math.floor(timeSpent / 60)}m</Text>
                          </View>
                          <View style={styles.recentTestMetricItem}>
                            <Text style={styles.recentTestAccuracyText}>{accuracy.toFixed(0)}%</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

       

        {/* Marketplace Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Study Materials</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {loadingContent ? (
            <View style={styles.marketplaceLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : marketplaceContent.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.marketplaceScrollContent}
            >
              {marketplaceContent.slice(0, 5).map((item) => {
                const creatorName = item.createdBy?.name || item.creator?.name || 'Unknown';
                const rating = item.averageRating || item.rating || 0;
                const purchaseCount = item.totalSales || item.purchaseCount || 0;
                const price = item.pricing?.originalPrice || item.price || 0;

                return (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.marketplaceCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('ContentDetails', { contentId: item._id })}
                  >
                    <Image
                      source={{
                        uri: item.thumbnail || 'https://via.placeholder.com/150/6B7280/FFFFFF?text=PDF',
                      }}
                      style={styles.marketplaceThumbnail}
                      resizeMode="cover"
                    />
                    <View style={styles.marketplaceCardContent}>
                      <Text style={styles.marketplaceTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      <Text style={styles.marketplaceCreator} numberOfLines={1}>
                        by {creatorName}
                      </Text>
                      <View style={styles.marketplaceFooter}>
                        <View style={styles.marketplaceRating}>
                          <CustomIcon name="star" size={12} color="#FFB800" />
                          <Text style={styles.marketplaceRatingText}>
                            {rating.toFixed(1)}
                          </Text>
                        </View>
                        {item.isFree ? (
                          <Text style={styles.marketplaceFreeTag}>FREE</Text>
                        ) : (
                          <Text style={styles.marketplacePrice}>₹{price}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyMarketplace}>
              <CustomIcon name="cart-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyMarketplaceText}>No content available</Text>
            </View>
          )}
        </View>

        {/* Promotional Banner */}
        {/* <View style={styles.promoContainer}>
          <View style={styles.promoBanner}>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Premium Features</Text>
              <Text style={styles.promoSubtitle}>Unlock advanced analytics & more</Text>
              <TouchableOpacity style={styles.promoButton}>
                <Text style={styles.promoButtonText}>UPGRADE NOW</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promoIconContainer}>
              <Text style={styles.promoEmoji}>🚀</Text>
            </View>
          </View>
        </View> */}

        {/* Most Loved Services */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <CustomIcon name="trophy" size={28} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{gamification.level}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <CustomIcon name="flash" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{userStats.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <View style={styles.statIconBox}>
                <CustomIcon name="wallet" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.statValue}>{gamification.coins}</Text>
              <Text style={styles.statLabel}>Coins</Text>
            </View>
          </View>
        </View> */}

        {/* Recent Activity */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Analytics')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 3).map((activity: any, index: number) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <CustomIcon name="checkmark-circle" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title || 'Quiz Completed'}</Text>
                  <Text style={styles.activityTime}>{activity.time || '2 hours ago'}</Text>
                </View>
                <Text style={styles.activityScore}>{activity.score || '18/20'}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <CustomIcon name="time-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          )}
        </View> */}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Exam Selection Modal */}
      <Modal
        visible={showExamModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExamModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Exams</Text>
              <TouchableOpacity onPress={() => setShowExamModal(false)}>
                <CustomIcon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {loadingExams ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 40 }} />
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  You can select multiple exams you're preparing for
                </Text>
                <FlatList
                  data={exams}
                  keyExtractor={(item) => item._id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isSelected = selectedExams.includes(item._id);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.examOption,
                          isSelected && styles.examOptionSelected,
                        ]}
                        onPress={() => {
                          setSelectedExams(prev => {
                            if (prev.includes(item._id)) {
                              return prev.filter(id => id !== item._id);
                            } else {
                              return [...prev, item._id];
                            }
                          });
                        }}
                      >
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <View style={styles.examOptionContent}>
                          <Text style={[
                            styles.examOptionTitle,
                            isSelected && styles.examOptionTitleSelected,
                          ]}>
                            {item.name}
                          </Text>
                          <Text style={styles.examOptionCode}>{item.examCode}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              </>
            )}

            {selectedExams.length > 0 && (
              <Text style={styles.selectedCountText}>
                {selectedExams.length} exam{selectedExams.length > 1 ? 's' : ''} selected
              </Text>
            )}

            <TouchableOpacity
              style={[
                styles.modalButton,
                selectedExams.length === 0 && styles.modalButtonDisabled,
              ]}
              onPress={handleExamChange}
              disabled={selectedExams.length === 0}
            >
              <Text style={styles.modalButtonText}>Update Exams</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  greeting: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  bannerContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  bannerLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bannerSlide: {
    width: width * 0.9,
    paddingHorizontal: 5,
  },
  banner: {
    borderRadius: 20,
    minHeight: 180,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 20,
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  bannerFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  bannerStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    marginTop: 16,
    zIndex: 1,
  },
  bannerStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  bannerStatValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  bannerStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  bannerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gray300,
  },
  paginationDotActive: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryCard: {
    width: (width - 64) / 3,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 95,
   
    borderWidth: 1,
    borderColor: COLORS.gray100,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  quickAccessCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  quickAccessContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  quickAccessText: {
    flex: 1,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  quickAccessSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  quickAccessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAccessButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Poppins-SemiBold',
  },
  marketplaceLoadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketplaceScrollContent: {
    paddingRight: 20,
  },
  marketplaceCard: {
    width: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
 
    borderWidth: 1,
    borderColor: COLORS.gray100,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  },
  marketplaceThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray100,
  },
  marketplaceCardContent: {
    padding: 12,
  },
  marketplaceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  marketplaceCreator: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  marketplaceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketplaceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketplaceRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  marketplaceFreeTag: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  marketplacePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyMarketplace: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMarketplaceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  recentTestsLoadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTestsScrollContent: {
    paddingRight: 20,
  },
  recentTestCard: {
    width: width * 0.9,
    height: 140,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginRight: 16,
    
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    flexDirection: 'row',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
  },
  recentTestLeftSection: {
    width: 100,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTestPercentage: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  recentTestScoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  recentTestScoreFraction: {
    backgroundColor: COLORS.textTertiary ,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentTestScoreFractionText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  recentTestRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    backgroundColor: COLORS.textTertiary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recentTestRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.white,
  },
  recentTestRightSection: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  recentTestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  recentTestTypeBadge: {
    backgroundColor: COLORS.primaryLight + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recentTestTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  recentTestDate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  recentTestTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  recentTestExam: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  recentTestMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentTestMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  recentTestMetricText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray700,
  },
  recentTestAccuracyText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  recentTestDividerVertical: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.gray300,
  },
  promoContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  promoBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  promoIconContainer: {
    marginLeft: 12,
  },
  promoEmoji: {
    fontSize: 48,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  activityScore: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyActivity: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyActivityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  examOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  examOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: COLORS.primary,
  },
  examOptionContent: {
    flex: 1,
  },
  examOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  examOptionTitleSelected: {
    color: COLORS.primary,
  },
  examOptionCode: {
    fontSize: 13,
    color: '#6B7280',
  },
  selectedCountText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;


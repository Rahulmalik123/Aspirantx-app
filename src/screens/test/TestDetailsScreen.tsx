import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import testService from '../../api/services/testService';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';

const TestDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { testId } = route.params || {};
  
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchTestDetails();
  }, []);

  // Refresh test details when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [TestDetails] Screen focused, refreshing test details...');
      fetchTestDetails();
    }, [testId])
  );

  const fetchTestDetails = async () => {
    try {
      setLoading(true);
      const response = await testService.getTestDetails(testId);
      console.log('🧪 [TestDetails] Full response:', JSON.stringify(response, null, 2));
      
      // If response has data property, use it, otherwise use response directly
      const testData = response.data || response;
      
      // Use attemptInfo from API response
      const isAttempted = testData.attemptInfo?.isAttempted || false;
      const canRetake = testData.attemptInfo?.canRetake !== false;
      
      console.log('🧪 [TestDetails] attemptInfo:', testData.attemptInfo);
      console.log('🧪 [TestDetails] isAttempted:', isAttempted);
      console.log('🧪 [TestDetails] canRetake:', canRetake);
      console.log('🧪 [TestDetails] isPaid:', testData.isPaid);
      console.log('🧪 [TestDetails] userPurchased:', testData.userPurchased);
      
      // Set userAttempted based on attemptInfo
      testData.userAttempted = isAttempted;
      testData.canRetake = canRetake;
      
      setTest(testData);
    } catch (error) {
      console.error('Error fetching test details:', error);
      Alert.alert('Error', 'Failed to load test details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setPurchasing(true);
      await testService.purchaseTest(testId);
      Alert.alert('Success', 'Test purchased successfully!');
      fetchTestDetails(); // Refresh to update purchase status
    } catch (error: any) {
      console.error('Error purchasing test:', error);
      Alert.alert('Error', error.message || 'Failed to purchase test');
    } finally {
      setPurchasing(false);
    }
  };

  const handleStartTest = async () => {
    try {
      const response = await testService.startTest(testId);
      console.log('📋 [Test Start] Full response:', response);
      console.log('📋 [Test Start] Attempt ID:', response._id);
      console.log('📋 [Test Start] Questions count:', response.questions?.length);
      console.log('📋 [Test Start] First question:', response.questions?.[0]);
      
      // If questions are not in start response, use test.questions
      const questionsToUse = response.questions || test.questions;
      
      if (!questionsToUse || questionsToUse.length === 0) {
        Alert.alert('Error', 'No questions found for this test');
        return;
      }
      
      // Transform questions to remove answer information
      const sanitizedQuestions = questionsToUse.map((q: any) => ({
        _id: q._id,
        question: q.questionText || q.question,
        options: q.options?.map((opt: any) => typeof opt === 'string' ? opt : opt.text) || [],
        questionType: q.questionType,
        subjectName: q.subjectName,
        topicName: q.topicName,
      }));
      
      console.log('📋 [Test Start] Sanitized questions:', sanitizedQuestions);
      
      navigation.navigate('TestAttempt', {
        testId,
        attemptId: response._id,
        questions: sanitizedQuestions,
        duration: test.duration,
      });
    } catch (error: any) {
      console.error('❌ [Test Start] Error:', error);
      Alert.alert('Error', error.message || 'Failed to start test');
    }
  };

  const handleAction = () => {
    if (test.isPaid && !test.userPurchased) {
      handlePurchase();
    } else {
      handleStartTest();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading test details...</Text>
      </View>
    );
  }

  if (!test) {
    return (
      <View style={styles.errorContainer}>
        <CustomIcon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Test Not Found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Test Details" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>

          {/* Primary Stats */}
          <View style={styles.primaryStats}>
            <View style={styles.primaryStat}>
              <CustomIcon name="document-text" size={24} color={COLORS.primary} />
              <Text style={styles.primaryStatValue}>{test.totalQuestions}</Text>
              <Text style={styles.primaryStatLabel}>Questions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.primaryStat}>
              <CustomIcon name="time" size={24} color={COLORS.primary} />
              <Text style={styles.primaryStatValue}>{test.duration}</Text>
              <Text style={styles.primaryStatLabel}>Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.primaryStat}>
              <CustomIcon name="trophy" size={24} color={COLORS.primary} />
              <Text style={styles.primaryStatValue}>{test.totalMarks}</Text>
              <Text style={styles.primaryStatLabel}>Marks</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        {(test.totalAttempts > 0 || test.averageScore > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Statistics</Text>
            <View style={styles.statsRow}>
              {test.totalAttempts > 0 && (
                <View style={styles.statBox}>
                  <CustomIcon name="people" size={24} color="COLORS.primary" />
                  <Text style={styles.statValue}>{test.totalAttempts}</Text>
                  <Text style={styles.statLabel}>Total Attempts</Text>
                </View>
              )}
              {test.averageScore > 0 && (
                <View style={styles.statBox}>
                  <CustomIcon name="trending-up" size={24} color="#10B981" />
                  <Text style={styles.statValue}>{test.averageScore}</Text>
                  <Text style={styles.statLabel}>Average Score</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Sections */}
        {test.sections && test.sections.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Test Sections</Text>
            {test.sections.map((section: any, index: number) => (
              <View key={index} style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  <Text style={styles.sectionQuestions}>{section.questions} Qs</Text>
                </View>
                {section.duration && (
                  <Text style={styles.sectionDuration}>⏱ {section.duration} minutes</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Instructions</Text>
          <View style={styles.instructionCard}>
            <View style={styles.instructionItem}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.instructionText}>
                Total questions: {test.totalQuestions}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.instructionText}>
                Time duration: {test.duration} minutes
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.instructionText}>
                Total marks: {test.totalMarks}
              </Text>
            </View>
            {test.negativeMarking && (
              <View style={styles.instructionItem}>
                <CustomIcon name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.instructionText}>
                  Negative marking: {test.negativeMarkingRatio || '1:4'}
                </Text>
              </View>
            )}
            <View style={styles.instructionItem}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.instructionText}>
                Each question carries equal marks
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.instructionText}>
                Review your answers before submitting
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        {test.userAttempted && test.attemptInfo?.attemptId ? (
          <View>
            <View style={styles.attemptedBanner}>
              <CustomIcon name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.attemptedText}>✅ Test Completed</Text>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.viewResultButton}
                onPress={() => {
                  navigation.navigate('TestResult', {
                    attemptId: test.attemptInfo.attemptId,
                    testId: testId,
                  });
                }}
                activeOpacity={0.8}
              >
                <CustomIcon name="trophy" size={20} color={COLORS.white} />
                <Text style={styles.viewResultButtonText}>View Result</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewAnswersButton}
                onPress={() => {
                  navigation.navigate('TestSolutions', {
                    attemptId: test.attemptInfo.attemptId,
                  });
                }}
                activeOpacity={0.8}
              >
                <CustomIcon name="document-text" size={20} color={COLORS.primary} />
                <Text style={styles.viewAnswersButtonText}>View Answers</Text>
              </TouchableOpacity>
            </View>
            {test.canRetake && (
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={handleStartTest}
                activeOpacity={0.8}
              >
                <CustomIcon name="refresh" size={20} color={COLORS.primary} />
                <Text style={styles.retakeButtonText}>Retake Test</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {test.isPaid && !test.userPurchased && (
              <View style={styles.priceInfo}>
                <CustomIcon name="cash" size={20} color="#F59E0B" />
                <Text style={styles.priceText}>{test.price} coins required</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.startButton,
                (purchasing || loading) && styles.startButtonDisabled,
              ]}
              onPress={handleAction}
              disabled={purchasing || loading}
              activeOpacity={0.8}
            >
              {purchasing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <CustomIcon 
                    name={test.isPaid && !test.userPurchased ? 'cart' : 'play-circle'} 
                    size={20} 
                    color={COLORS.white} 
                  />
                  <Text style={styles.startButtonText}>
                    {test.isPaid && !test.userPurchased 
                      ? `Purchase for ${test.price} coins` 
                      : 'Start Test'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 24,
    fontFamily: 'Poppins-SemiBold',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Poppins-SemiBold',
  },
  headerCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 12,
  },
  testTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  testDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  primaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  primaryStat: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  primaryStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  primaryStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  section: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionQuestions: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionDuration: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  instructionCard: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'Poppins-Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  attemptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    marginBottom: 12,
  },
  attemptedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  viewResultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewResultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewAnswersButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  viewAnswersButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    fontFamily: 'Poppins-SemiBold',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default TestDetailsScreen;

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';

// Exam Screens
import ExamCategoriesScreen from '../screens/exam/ExamCategoriesScreen';
import ExamListScreen from '../screens/exam/ExamListScreen';
import ExamDetailsScreen from '../screens/exam/ExamDetailsScreen';

// Practice Screens
import DailyPracticeScreen from '../screens/practice/DailyPracticeScreen';
import PracticeResultScreen from '../screens/practice/PracticeResultScreen';
import TopicPracticeScreen from '../screens/practice/TopicPracticeScreen';
import SubjectPracticeScreen from '../screens/practice/SubjectPracticeScreen';
import RandomPracticeScreen from '../screens/practice/RandomPracticeScreen';
// import PYQPracticeScreen from '../screens/practice/PYQPracticeScreen'; // PYQ - Temporarily Commented Out
import WeakConceptPracticeScreen from '../screens/practice/WeakConceptPracticeScreen';
import ConceptPracticeScreen from '../screens/practice/ConceptPracticeScreen';
import QuizAttemptScreen from '../screens/practice/QuizAttemptScreen';

// Test Screens
import TestListScreen from '../screens/test/TestListScreen';
import TestDetailsScreen from '../screens/test/TestDetailsScreen';
import TestAttemptScreen from '../screens/test/TestAttemptScreen';
import TestResultScreen from '../screens/test/TestResultScreen';
import TestSolutionsScreen from '../screens/test/TestSolutionsScreen';
import TestHistoryScreen from '../screens/test/TestHistoryScreen';
import SubjectListScreen from '../screens/test/SubjectListScreen';
import TopicSelectionScreen from '../screens/test/TopicSelectionScreen';

// Tournament Screens
import TournamentListScreen from '../screens/tournament/TournamentListScreen';
import TournamentDetailsScreen from '../screens/tournament/TournamentDetailsScreen';
import LiveLeaderboardScreen from '../screens/tournament/LiveLeaderboardScreen';

// Battle Screens
import CreateBattleScreen from '../screens/battle/CreateBattleScreen';
import BattleListScreen from '../screens/battle/BattleListScreen';
import LiveBattleScreen from '../screens/battle/LiveBattleScreen';
import BattleResultScreen from '../screens/battle/BattleResultScreen';

// Wallet Screens
import WalletScreen from '../screens/wallet/WalletScreen';
import RechargeScreen from '../screens/wallet/RechargeScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';

// Marketplace Screens
import MarketplaceScreen from '../screens/Marketplace/MarketplaceScreen';
import ContentDetailsScreen from '../screens/Marketplace/ContentDetailsScreen';
import MyPurchasesScreen from '../screens/Marketplace/MyPurchasesScreen';
import MyUploadsScreen from '../screens/Marketplace/MyUploadsScreen';

// Creator Screens
import CreatorDashboardScreen from '../screens/creator/CreatorDashboardScreen';
import BecomeCreatorScreen from '../screens/creator/BecomeCreatorScreen';
import UploadContentScreen from '../screens/creator/UploadContentScreen';
import EditContentScreen from '../screens/creator/EditContentScreen';

// Analytics Screens
import AnalyticsScreen from '../screens/analytics/AnalyticsScreen';

// Bookmarks Screens
import BookmarkedQuestionsScreen from '../screens/bookmarks/BookmarkedQuestionsScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import FollowersListScreen from '../screens/profile/FollowersListScreen';
import MyPostsScreen from '../screens/profile/MyPostsScreen';
import TargetExamsScreen from '../screens/profile/TargetExamsScreen';
import SavedQuestionsScreen from '../screens/profile/SavedQuestionsScreen';
import SavedContentScreen from '../screens/profile/SavedContentScreen';
import StudyPlanScreen from '../screens/profile/StudyPlanScreen';
import PerformanceReportScreen from '../screens/profile/PerformanceReportScreen';
import AchievementsScreen from '../screens/profile/AchievementsScreen';
import LeaderboardScreen from '../screens/profile/LeaderboardScreen';
import EarnCoinsScreen from '../screens/profile/EarnCoinsScreen';
import ReferralScreen from '../screens/profile/ReferralScreen';
import LanguageScreen from '../screens/profile/LanguageScreen';
import DownloadSettingsScreen from '../screens/profile/DownloadSettingsScreen';
import HelpScreen from '../screens/profile/HelpScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import AboutScreen from '../screens/profile/AboutScreen';

// Social Screens
import PostDetailScreen from '../screens/social/PostDetailScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  ExamCategories: undefined;
  ExamList: { categoryId: string };
  ExamDetails: { examId: string };
  DailyPractice: undefined;
  QuizAttempt: { quizId: string; isReview: boolean };
  PracticeResult: { score: number; total: number };
  TopicPractice: { topicId: string };
  SubjectPractice: { subjectId: string };
  RandomPractice: { examId?: string };
  PYQPractice: { examId?: string };
  WeakConceptPractice: undefined;
  ConceptPractice: { conceptId: string; conceptName: string };
  QuestionPractice: { questions: any[]; title: string; mode: string; conceptId?: string };
  TestList: { examId?: string; examName?: string; subjectId?: string; subjectName?: string; topicIds?: string[]; type?: string };
  TestDetails: { testId: string };
  TestAttempt: { testId: string };
  TestResult: { resultId: string };
  TestSolutions: { attemptId: string };
  TestHistory: undefined;
  SubjectList: { examId: string; examName: string };
  TopicSelection: { subjectId: string; subjectName: string; examId: string; examName: string };
  TournamentList: undefined;
  TournamentDetails: { tournamentId: string };
  LiveLeaderboard: { tournamentId: string };
  CreateBattle: undefined;
  BattleList: undefined;
  LiveBattle: { battleId: string };
  BattleResult: { battleId: string };
  Wallet: undefined;
  Recharge: undefined;
  TransactionHistory: undefined;
  Marketplace: undefined;
  ContentDetails: { contentId: string };
  MyPurchases: undefined;
  MyUploads: undefined;
  CreatorDashboard: undefined;
  BecomeCreator: undefined;
  UploadContent: undefined;
  EditContent: { contentId: string };
  Analytics: undefined;
  BookmarkedQuestions: undefined;
  EditProfile: undefined;
  UserProfile: { userId: string };
  TargetExams: undefined;
  SavedQuestions: undefined;
  SavedContent: undefined;
  StudyPlan: undefined;
  PerformanceReport: undefined;
  Achievements: undefined;
  Leaderboard: undefined;
  EarnCoins: undefined;
  Referral: undefined;
  Language: undefined;
  DownloadSettings: undefined;
  Help: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
  About: undefined;
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      
      {/* Exam Routes */}
      <Stack.Screen name="ExamCategories" component={ExamCategoriesScreen} />
      <Stack.Screen name="ExamList" component={ExamListScreen} />
      <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} />
      
      {/* Practice Routes */}
      <Stack.Screen name="DailyPractice" component={DailyPracticeScreen} />
      <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
      <Stack.Screen name="PracticeResult" component={PracticeResultScreen} />
      <Stack.Screen name="TopicPractice" component={TopicPracticeScreen} />
      <Stack.Screen name="SubjectPractice" component={SubjectPracticeScreen} />
      <Stack.Screen name="RandomPractice" component={RandomPracticeScreen} />
      {/* PYQ - Temporarily Commented Out */}
      {/* <Stack.Screen name="PYQPractice" component={PYQPracticeScreen} /> */}
      <Stack.Screen name="WeakConceptPractice" component={WeakConceptPracticeScreen} />
      <Stack.Screen name="ConceptPractice" component={ConceptPracticeScreen} />
      
      {/* Test Routes */}
      <Stack.Screen name="TestList" component={TestListScreen} />
      <Stack.Screen name="TestDetails" component={TestDetailsScreen} />
      <Stack.Screen name="TestAttempt" component={TestAttemptScreen} />
      <Stack.Screen name="TestResult" component={TestResultScreen} />
      <Stack.Screen name="TestSolutions" component={TestSolutionsScreen} />
      <Stack.Screen name="TestHistory" component={TestHistoryScreen} />
      <Stack.Screen name="SubjectList" component={SubjectListScreen} />
      <Stack.Screen name="TopicSelection" component={TopicSelectionScreen} />
      
      {/* Tournament Routes */}
      <Stack.Screen name="TournamentList" component={TournamentListScreen} />
      <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} />
      <Stack.Screen name="LiveLeaderboard" component={LiveLeaderboardScreen} />
      
      {/* Battle Routes */}
      <Stack.Screen name="CreateBattle" component={CreateBattleScreen} />
      <Stack.Screen name="BattleList" component={BattleListScreen} />
      <Stack.Screen name="LiveBattle" component={LiveBattleScreen} />
      <Stack.Screen name="BattleResult" component={BattleResultScreen} />
      
      {/* Wallet Routes */}
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Recharge" component={RechargeScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      
      {/* Marketplace Routes */}
      <Stack.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ContentDetails" 
        component={ContentDetailsScreen}
        options={{ 
          title: 'Content Details',
          headerShown: false
        }}
      />
      <Stack.Screen 
        name="MyPurchases" 
        component={MyPurchasesScreen}
        options={{ title: 'My Purchases' }}
      />
      <Stack.Screen 
        name="MyUploads" 
        component={MyUploadsScreen}
        options={{ headerShown: false }}
      />
      
      {/* Creator Routes */}
      <Stack.Screen 
        name="CreatorDashboard" 
        component={CreatorDashboardScreen}
        options={{ title: 'Creator Dashboard' }}
      />
      <Stack.Screen 
        name="BecomeCreator" 
        component={BecomeCreatorScreen}
        options={{ title: 'Become a Creator' }}
      />
      <Stack.Screen 
        name="UploadContent" 
        component={UploadContentScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EditContent" 
        component={EditContentScreen}
        options={{ headerShown: false }}
      />
      
      {/* Analytics Routes */}
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
      
      {/* Bookmarks Routes */}
      <Stack.Screen name="BookmarkedQuestions" component={BookmarkedQuestionsScreen} />
      
      {/* Profile Routes */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TargetExams" component={TargetExamsScreen} />
      <Stack.Screen name="SavedQuestions" component={SavedQuestionsScreen} />
      <Stack.Screen name="SavedContent" component={SavedContentScreen} />
      <Stack.Screen name="StudyPlan" component={StudyPlanScreen} />
      <Stack.Screen name="PerformanceReport" component={PerformanceReportScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="EarnCoins" component={EarnCoinsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="DownloadSettings" component={DownloadSettingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      
      {/* Social Routes */}
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;

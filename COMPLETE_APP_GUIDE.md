# 📱 AspirantHub - Complete React Native App Documentation

## 🎯 Overview
**AspirantHub** is a comprehensive Government Exam preparation mobile app built with React Native, TypeScript, Redux Toolkit, and integrated with a robust Node.js backend. The app covers SSC, Railway, Banking, Defense, Teaching, Police exams, and more.

---

## 📚 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [API Integration Guide](#api-integration-guide)
5. [Feature Modules](#feature-modules)
6. [State Management](#state-management)
7. [Authentication Flow](#authentication-flow)
8. [Navigation Structure](#navigation-structure)
9. [Key Features](#key-features)

---

## 🏗️ Architecture Overview

### **Clean Architecture Pattern**
```
┌─────────────────────────────────────────────┐
│           Presentation Layer                │
│  (Screens, Components, Navigation)          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│        Business Logic Layer                 │
│    (Redux Slices, Custom Hooks)             │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│          Data Access Layer                  │
│   (API Services, AsyncStorage, Socket)      │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Backend API Layer                   │
│    (RESTful APIs + Socket.io)               │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### **Frontend**
- **React Native**: 0.73+
- **TypeScript**: Type-safe development
- **Redux Toolkit**: State management
- **React Navigation**: Navigation (Stack + Bottom Tabs)
- **Axios**: HTTP client
- **Socket.io Client**: Real-time features
- **AsyncStorage**: Local persistence
- **React Native Safe Area Context**: Safe area handling

### **Backend Integration**
- **Base URL**: `http://192.168.31.70:8080`
- **API Version**: `v1`
- **Authentication**: JWT (Access + Refresh tokens)
- **OTP Provider**: Twilio Verify

---

## 📁 Project Structure

```
AspirantHub/
├── src/
│   ├── api/                          # API Integration Layer
│   │   ├── client.ts                 # Axios instance with interceptors
│   │   ├── endpoints.ts              # All API endpoint constants
│   │   └── services/                 # Service modules
│   │       ├── authService.ts        # Auth APIs
│   │       ├── userService.ts        # User profile & stats
│   │       ├── examService.ts        # Exam categories & details
│   │       ├── practiceService.ts    # Practice sessions
│   │       ├── testService.ts        # Test series
│   │       ├── tournamentService.ts  # Tournaments
│   │       ├── battleService.ts      # 1v1 battles
│   │       ├── walletService.ts      # Wallet & coins
│   │       ├── paymentService.ts     # Razorpay integration
│   │       ├── contentService.ts     # Creator content
│   │       ├── socialService.ts      # Social feed
│   │       └── notificationService.ts # Push notifications
│   │
│   ├── components/                   # Reusable Components
│   │   ├── common/                   # Generic components
│   │   ├── layout/                   # Layout components
│   │   └── [feature]/                # Feature-specific components
│   │
│   ├── constants/                    # App Constants
│   │   ├── colors.ts                 # Color palette
│   │   ├── spacing.ts                # Spacing values
│   │   └── routes.ts                 # Route names
│   │
│   ├── hooks/                        # Custom Hooks
│   │   └── [custom hooks]
│   │
│   ├── navigation/                   # Navigation Configuration
│   │   ├── AppNavigator.tsx          # Main app navigator
│   │   ├── AuthNavigator.tsx         # Auth flow navigator
│   │   └── MainTabNavigator.tsx      # Bottom tabs
│   │
│   ├── screens/                      # Screen Components
│   │   ├── auth/                     # Authentication screens
│   │   ├── home/                     # Home dashboard
│   │   ├── profile/                  # User profile
│   │   ├── practice/                 # Practice screens
│   │   ├── test/                     # Test series screens
│   │   ├── tournament/               # Tournament screens
│   │   ├── battle/                   # Battle screens
│   │   └── wallet/                   # Wallet screens
│   │
│   ├── store/                        # Redux Store
│   │   ├── index.ts                  # Store configuration
│   │   └── slices/                   # Redux slices
│   │       ├── authSlice.ts          # Auth state
│   │       └── [other slices]
│   │
│   ├── theme/                        # Theming
│   │   └── index.ts                  # Theme configuration
│   │
│   ├── types/                        # TypeScript Types
│   │   └── [type definitions]
│   │
│   └── utils/                        # Utility Functions
│       └── [helper functions]
│
├── android/                          # Android native code
├── ios/                             # iOS native code
└── App.tsx                          # Root component
```

---

## 🔌 API Integration Guide

### **Base Configuration**

#### **API Client Setup** (`src/api/client.ts`)
```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.31.70:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout user
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
      // Navigate to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🌐 Complete API Reference

### **1. Authentication APIs**

#### **Phone OTP Authentication**
```typescript
// Send OTP
POST /api/v1/otp/send-phone
Body: { phone: "9876543210" }
Response: { success: true, message: "OTP sent" }

// Verify OTP
POST /api/v1/otp/verify-phone
Body: { phone: "9876543210", otp: "123456" }
Response: {
  success: true,
  accessToken: "jwt_token",
  refreshToken: "refresh_token",
  user: { _id, name, phone, ... },
  isNewUser: true/false
}

// Complete Profile (New Users)
POST /api/v1/otp/complete-profile
Body: { phone, name, email, referralCode? }
Response: {
  success: true,
  accessToken: "jwt_token",
  refreshToken: "refresh_token",
  user: { ... }
}

// Get Current User
GET /api/v1/auth/me
Headers: { Authorization: "Bearer token" }
Response: { success: true, data: { user } }
```

---

### **2. User Profile & Stats APIs**

```typescript
// Get User Profile
GET /api/v1/users/profile
Response: {
  user: {
    _id, name, email, phone,
    coins, karma, level, experience,
    currentStreak, longestStreak,
    targetExams: [...],
    stats: { totalQuestions, correctAnswers, accuracy }
  },
  wallet: { balance, totalEarned }
}

// Update Profile
PUT /api/v1/users/profile
Body: { name?, phone?, dateOfBirth?, gender?, state?, city?, targetExams?, primaryExam? }
Response: { success: true, user: { ... } }

// Get User Stats
GET /api/v1/users/stats
Response: {
  stats: {
    totalQuestions: 150,
    correctAnswers: 120,
    incorrectAnswers: 30,
    totalTests: 5,
    completedTests: 4,
    accuracy: 80
  },
  gamification: {
    coins: 500,
    karma: 120,
    level: 5,
    experience: 2500,
    currentStreak: 7,
    longestStreak: 15
  }
}

// Get Wallet Transactions
GET /api/v1/users/wallet/transactions?page=1&limit=20
Response: {
  wallet: { balance, totalEarned },
  data: [{ type, amount, source, status, createdAt }],
  pagination: { total, page, limit, pages }
}
```

---

### **3. Exam APIs**

```typescript
// Get Exam Categories (Public)
GET /api/v1/exams/public/categories
Response: {
  data: [
    { _id, name, icon, examCount, description }
  ]
}

// Get Exams by Category (Public)
GET /api/v1/exams/public/category/:categoryId
Response: {
  data: [
    { _id, name, examCode, category, description, syllabus, isActive }
  ]
}

// Get Exam Details (Public)
GET /api/v1/exams/public/details/:examId
Response: {
  data: {
    _id, name, examCode, category,
    description, syllabus: [...],
    totalQuestions, duration,
    eligibility, examPattern
  }
}

// Search Exams (Public)
GET /api/v1/exams/public/search?q=ssc
Response: { data: [...exams] }

// Get Popular Exams (Public)
GET /api/v1/exams/public/popular
Response: { data: [...exams] }

// Authenticated versions available at:
GET /api/v1/exams/categories
GET /api/v1/exams/category/:categoryId
GET /api/v1/exams/details/:examId
GET /api/v1/exams/search
GET /api/v1/exams/featured
```

---

### **4. Practice APIs**

```typescript
// Get Daily Practice
GET /api/v1/practice/daily/:examId
Response: {
  data: {
    _id, examId, questions: [...],
    totalQuestions: 20,
    date: "2026-01-25"
  }
}

// Submit Daily Practice
POST /api/v1/practice/daily/:practiceId/submit
Body: {
  answers: [
    { questionId, selectedOption, timeTaken }
  ]
}
Response: {
  score: 18,
  total: 20,
  accuracy: 90,
  correctAnswers: 18,
  incorrectAnswers: 2,
  timeTaken: 1200,
  coinsEarned: 50,
  experienceEarned: 100
}

// Get Questions by Topic
GET /api/v1/practice/topic/:topicId?limit=20
Response: { data: { questions: [...] } }

// Get Questions by Subject
GET /api/v1/practice/subject/:subjectId?limit=20
Response: { data: { questions: [...] } }

// Get Random Questions
GET /api/v1/practice/random/:examId?count=10
Response: { data: { questions: [...] } }

// Get Previous Year Questions (PYQ)
GET /api/v1/practice/pyq/:examId?year=2023&subject=math
Response: { data: { questions: [...] } }

// Get Questions by Concept
GET /api/v1/practice/concept/:conceptId
Response: { data: { questions: [...] } }

// Get Weak Concepts
GET /api/v1/practice/weak-concepts
Response: {
  data: [
    { conceptId, name, accuracy: 45, questionsAttempted: 20 }
  ]
}
```

---

### **5. Test Series APIs**

```typescript
// Get Tests by Exam (Public)
GET /api/v1/tests/:examId?type=mock|sectional&difficulty=easy|medium|hard
Response: {
  data: [
    {
      _id, title, description, examId,
      type: "mock" | "sectional",
      difficulty: "easy" | "medium" | "hard",
      totalQuestions: 100,
      duration: 180,
      price: 50,
      isPaid: true,
      totalAttempts: 500
    }
  ]
}

// Get Test Details (Public)
GET /api/v1/tests/details/:testId
Response: {
  data: {
    _id, title, description,
    sections: [
      { name: "English", questions: 25, duration: 30 }
    ],
    instructions: [...],
    totalMarks: 100,
    negativeMarking: true
  }
}

// Start Test (Protected)
POST /api/v1/tests/start/:testId
Response: {
  attemptId: "...",
  startedAt: "...",
  questions: [...],
  expiresAt: "..."
}

// Submit Test (Protected)
POST /api/v1/tests/submit/:attemptId
Body: {
  answers: [
    { questionId, selectedOption, timeTaken, section }
  ]
}
Response: {
  score: 85,
  rank: 42,
  percentile: 92,
  sectionWise: [
    { section: "English", score: 20, total: 25 }
  ],
  analysis: { ... }
}

// Get Test Results (Protected)
GET /api/v1/tests/results/:attemptId
Response: { data: { detailed results with solutions } }

// Get Test Leaderboard (Public)
GET /api/v1/tests/leaderboard/:testId?page=1&limit=50
Response: {
  data: [
    { rank: 1, userId, name, score, percentile }
  ]
}

// Get User Test History (Protected)
GET /api/v1/tests/history/me?page=1&limit=10
Response: {
  data: [
    { attemptId, testId, title, score, rank, attemptedAt }
  ]
}
```

---

### **6. Tournament APIs**

```typescript
// Get Active Tournaments (Public)
GET /api/v1/tournaments?status=upcoming|live|completed
Response: {
  data: [
    {
      _id, title, description,
      startDate, endDate,
      entryFee: 100,
      prizePool: 10000,
      participants: 500,
      maxParticipants: 1000,
      status: "upcoming" | "live" | "completed"
    }
  ]
}

// Get Tournament Details (Public)
GET /api/v1/tournaments/details/:tournamentId
Response: {
  data: {
    _id, title, description,
    rounds: [...],
    prizes: [
      { rank: 1, amount: 5000, coins: 1000 }
    ],
    rules: [...],
    schedule: { ... }
  }
}

// Join Tournament (Protected)
POST /api/v1/tournaments/join/:tournamentId
Response: {
  success: true,
  message: "Joined successfully",
  participantId: "..."
}

// Get Tournament Leaderboard (Public)
GET /api/v1/tournaments/leaderboard/:tournamentId?page=1&limit=100
Response: {
  data: [
    { rank: 1, userId, name, score, accuracy, timeTaken }
  ]
}

// Get My Tournaments (Protected)
GET /api/v1/tournaments/my-tournaments?status=active|completed
Response: {
  data: [
    { tournamentId, title, myRank, myScore, status }
  ]
}
```

---

### **7. Battle (1v1) APIs**

```typescript
// Create Battle (Protected)
POST /api/v1/battles/create
Body: {
  examId: "...",
  subject?: "...",
  difficulty: "easy" | "medium" | "hard",
  questionsCount: 10,
  betAmount: 50
}
Response: {
  battleId: "...",
  code: "ABC123",
  expiresAt: "..."
}

// Get Available Battles (Protected)
GET /api/v1/battles/available?examId=...&difficulty=medium
Response: {
  data: [
    {
      battleId, creatorName, difficulty,
      questionsCount, betAmount,
      createdAt
    }
  ]
}

// Join Battle (Protected)
POST /api/v1/battles/join/:battleId
Body: { code?: "ABC123" }
Response: {
  success: true,
  battle: { ... },
  questions: [...]
}

// Submit Battle Answer (Protected)
POST /api/v1/battles/:battleId/answer
Body: {
  questionId: "...",
  selectedOption: "A",
  timeTaken: 15
}
Response: {
  correct: true,
  currentScore: 5,
  opponentScore: 4
}

// Get Battle Results (Protected)
GET /api/v1/battles/results/:battleId
Response: {
  winner: "userId",
  myScore: 8,
  opponentScore: 7,
  breakdown: [...],
  coinsWon: 100
}

// Get My Battles (Protected)
GET /api/v1/battles/my-battles?status=active|completed&page=1
Response: {
  data: [
    { battleId, opponent, myScore, opponentScore, status, result }
  ]
}
```

---

### **8. Payment & Wallet APIs**

```typescript
// Get Coin Packages (Public)
GET /api/v1/payments/packages
Response: {
  data: [
    {
      _id, coins: 100, price: 99,
      discount: 10, popular: true,
      bonus: 10
    }
  ]
}

// Create Payment Order (Protected)
POST /api/v1/payments/create-order
Body: { packageId: "..." }
Response: {
  orderId: "...",
  amount: 99,
  currency: "INR",
  razorpayOrderId: "..."
}

// Verify Payment (Protected)
POST /api/v1/payments/verify
Body: {
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "..."
}
Response: {
  success: true,
  coinsAdded: 100,
  newBalance: 500
}

// Get Payment History (Protected)
GET /api/v1/payments/history?page=1&limit=20
Response: {
  data: [
    {
      orderId, amount, coins,
      status: "success" | "failed",
      createdAt
    }
  ]
}
```

---

### **9. Content Marketplace APIs**

```typescript
// Get Content (Public)
GET /api/v1/content?type=pdf|video&subject=math&page=1
Response: {
  data: [
    {
      _id, title, description,
      type: "pdf" | "video",
      price: 50,
      thumbnail, rating: 4.5,
      downloads: 500,
      creator: { name, verified }
    }
  ]
}

// Get Content Details (Public)
GET /api/v1/content/details/:contentId
Response: {
  data: {
    _id, title, description,
    content: "url",
    preview: "url",
    reviews: [...],
    relatedContent: [...]
  }
}

// Purchase Content (Protected)
POST /api/v1/content/purchase/:contentId
Response: {
  success: true,
  contentUrl: "...",
  coinsDeducted: 50
}

// Get My Purchases (Protected)
GET /api/v1/content/my-purchases?type=pdf&page=1
Response: {
  data: [
    { contentId, title, type, purchasedAt, contentUrl }
  ]
}

// Add Review (Protected)
POST /api/v1/content/review/:contentId
Body: { rating: 5, comment: "Excellent" }
Response: { success: true }
```

---

### **10. Creator Platform APIs**

```typescript
// Become Creator (Protected)
POST /api/v1/creator/register
Body: {
  bio: "...",
  expertise: ["SSC", "Banking"],
  idProof: "url"
}
Response: { success: true, status: "pending" }

// Upload Content (Protected - Creator only)
POST /api/v1/creator/content
Body: {
  title, description, type,
  file: "multipart",
  price, subject, tags: [...]
}
Response: {
  contentId: "...",
  status: "pending_approval"
}

// Get My Content (Protected - Creator)
GET /api/v1/creator/content?status=approved|pending|rejected
Response: {
  data: [
    { contentId, title, status, downloads, earnings }
  ]
}

// Get Creator Dashboard (Protected - Creator)
GET /api/v1/creator/dashboard
Response: {
  stats: {
    totalContent: 25,
    totalDownloads: 500,
    totalEarnings: 5000,
    pendingApprovals: 3
  },
  recentSales: [...],
  topContent: [...]
}

// Get Earnings (Protected - Creator)
GET /api/v1/creator/earnings?startDate=...&endDate=...
Response: {
  totalEarnings: 5000,
  breakdown: [
    { contentId, title, sales: 50, earnings: 1000 }
  ]
}

// Request Payout (Protected - Creator)
POST /api/v1/creator/payout/request
Body: { amount: 2000 }
Response: {
  payoutId: "...",
  status: "pending",
  processingTime: "3-5 days"
}

// Get Payouts (Protected - Creator)
GET /api/v1/creator/payouts?status=pending|completed
Response: {
  data: [
    { payoutId, amount, status, requestedAt, processedAt }
  ]
}

// Update Bank Details (Protected - Creator)
POST /api/v1/creator/bank-details
Body: {
  accountNumber, ifsc, accountHolderName,
  bankName, branch
}
Response: { success: true }
```

---

### **11. Social Feed APIs**

```typescript
// Create Post (Protected)
POST /api/v1/social/posts
Body: {
  text: "Just scored 95%!",
  image?: "url",
  type: "achievement" | "doubt" | "general"
}
Response: { postId: "..." }

// Get Feed (Protected)
GET /api/v1/social/feed?page=1&limit=20
Response: {
  data: [
    {
      postId, userId, userName, userAvatar,
      text, image, type,
      likes: 50, comments: 10,
      createdAt, isLiked: false
    }
  ]
}

// Like Post (Protected)
POST /api/v1/social/posts/:postId/like
Response: { success: true, totalLikes: 51 }

// Add Comment (Protected)
POST /api/v1/social/posts/:postId/comment
Body: { text: "Great job!" }
Response: { commentId: "..." }

// Get Comments (Protected)
GET /api/v1/social/posts/:postId/comments?page=1
Response: {
  data: [
    { commentId, userId, userName, text, likes, createdAt }
  ]
}

// Like Comment (Protected)
POST /api/v1/social/comments/:commentId/like
Response: { success: true }

// Follow User (Protected)
POST /api/v1/social/follow/:targetUserId
Response: { success: true, isFollowing: true }

// Get User Posts (Protected)
GET /api/v1/social/posts/user/:userId?page=1
Response: { data: [...posts] }
```

---

### **12. Notification APIs**

```typescript
// Register FCM Token (Protected)
POST /api/v1/notifications/register-token
Body: { fcmToken: "..." }
Response: { success: true }

// Get Notifications (Protected)
GET /api/v1/notifications?page=1&limit=20&read=false
Response: {
  data: [
    {
      _id, title, body, type,
      data: { ... },
      read: false,
      createdAt
    }
  ],
  unreadCount: 5
}

// Mark as Read (Protected)
PUT /api/v1/notifications/:notificationId/read
Response: { success: true }

// Mark All as Read (Protected)
PUT /api/v1/notifications/read-all
Response: { success: true }

// Delete Notification (Protected)
DELETE /api/v1/notifications/:notificationId
Response: { success: true }

// Get Notification Settings (Protected)
GET /api/v1/notifications/settings
Response: {
  emailNotifications: true,
  pushNotifications: true,
  preferences: {
    tournaments: true,
    battles: true,
    updates: false
  }
}

// Update Notification Settings (Protected)
PUT /api/v1/notifications/settings
Body: { emailNotifications: false, preferences: { ... } }
Response: { success: true }
```

---

## 🎨 Feature Modules

### **1. Authentication Module**

#### **Screens:**
- `LoginScreen.tsx` - Phone number input with country code
- `OTPScreen.tsx` - 6-digit OTP verification
- `ProfileSetupScreen.tsx` - Name, email, referral code for new users
- `RegisterScreen.tsx` - Alternative registration flow

#### **Key Features:**
- Phone-based OTP authentication via Twilio
- Auto-detect country code
- OTP auto-read (Android)
- Resend OTP with timer
- AsyncStorage for token persistence
- Navigation reset on successful auth

#### **Flow:**
```
Login → Enter Phone → Send OTP → Verify OTP
  ↓
Is New User?
  ├─ Yes → Profile Setup → Home
  └─ No → Home
```

---

### **2. Home Dashboard Module**

#### **Screen:**
- `HomeScreen.tsx` - Main dashboard

#### **Features:**
- Welcome header with user name
- Streak badge (🔥 days)
- Stats cards: Solved questions, Accuracy %, Level
- Continue Learning card with progress
- Quick Actions grid: Practice, Test, Analytics, Saved
- Recent Activity feed
- Pull-to-refresh
- Real-time data from `/api/v1/users/stats`

#### **API Integration:**
```typescript
const fetchDashboard = async () => {
  const data = await userService.getStats();
  // Shows: totalQuestions, accuracy, level, currentStreak, coins
};
```

---

### **3. Practice Module**

#### **Screens:**
- `DailyPracticeScreen.tsx` - Daily 20 questions
- `TopicPracticeScreen.tsx` - Practice by topic
- `SubjectPracticeScreen.tsx` - Practice by subject
- `WeakConceptsScreen.tsx` - Focus on weak areas
- `PYQScreen.tsx` - Previous year questions

#### **Features:**
- Daily practice with time limit
- Topic-wise practice
- Subject-wise practice
- Weak concept identification
- Year-wise PYQ filtering
- Bookmark questions
- Report incorrect questions
- Detailed solutions
- Progress tracking

---

### **4. Test Series Module**

#### **Screens:**
- `TestListScreen.tsx` - All tests by exam
- `TestDetailsScreen.tsx` - Test info & instructions
- `TestAttemptScreen.tsx` - Live test taking
- `TestResultScreen.tsx` - Detailed analysis
- `LeaderboardScreen.tsx` - Test rankings

#### **Features:**
- Mock tests & sectional tests
- Timer with auto-submit
- Section-wise navigation
- Answer sheet overview
- Mark for review
- Detailed analysis with solutions
- Rank & percentile
- Section-wise performance
- Compare with toppers

---

### **5. Tournament Module**

#### **Screens:**
- `TournamentListScreen.tsx` - Active tournaments
- `TournamentDetailsScreen.tsx` - Tournament info
- `LiveLeaderboardScreen.tsx` - Real-time rankings
- `MyTournamentsScreen.tsx` - Joined tournaments

#### **Features:**
- Live tournaments
- Real-time leaderboard updates (Socket.io)
- Entry fee & prize pool
- Multi-round tournaments
- Winner announcements
- Prize distribution

---

### **6. Battle (1v1) Module**

#### **Screens:**
- `CreateBattleScreen.tsx` - Create new battle
- `BattleListScreen.tsx` - Available battles
- `LiveBattleScreen.tsx` - Real-time 1v1 quiz
- `BattleResultScreen.tsx` - Win/lose screen

#### **Features:**
- Create custom battles
- Join via code or list
- Real-time question synchronization
- Live score updates
- Winner animation
- Coin betting system
- Battle history

---

### **7. Wallet & Payments Module**

#### **Screens:**
- `WalletScreen.tsx` - Coin balance & transactions
- `RechargeScreen.tsx` - Buy coin packages
- `TransactionHistoryScreen.tsx` - Past transactions

#### **Features:**
- Coin balance display
- Buy coins via Razorpay
- Transaction history
- Earning sources breakdown
- Spending breakdown
- Referral earnings

---

### **8. Profile Module**

#### **Screen:**
- `ProfileScreen.tsx` - User profile & settings

#### **Features:**
- Avatar with first letter
- User stats: Streak, Coins
- Menu items:
  - Edit Profile
  - My Progress
  - Settings
  - Logout
- Clean minimal design

---

## 🔐 State Management (Redux)

### **Auth Slice** (`authSlice.ts`)

#### **State:**
```typescript
{
  isAuthenticated: boolean,
  token: string | null,
  user: User | null,
  loading: boolean,
  error: string | null
}
```

#### **Thunks:**
- `sendOTP` - Send OTP to phone
- `verifyOTP` - Verify OTP & login
- `completeProfile` - Complete new user profile
- `checkAuth` - Check if user is logged in (on app start)
- `logout` - Clear all auth data

#### **AsyncStorage Keys:**
- `authToken` - JWT access token
- `refreshToken` - Refresh token
- `userData` - JSON stringified user object

#### **Features:**
- Token persistence
- Auto-login on app restart
- Cached user data for instant load
- Logout clears all storage

---

## 🧭 Navigation Structure

### **Root Navigator** (`AppNavigator.tsx`)
```typescript
AppNavigator
├─ isAuthenticated === false
│  └─ AuthNavigator (Stack)
│     ├─ LoginScreen
│     ├─ OTPScreen
│     ├─ ProfileSetupScreen
│     └─ RegisterScreen
│
└─ isAuthenticated === true
   └─ MainNavigator (Bottom Tabs)
      ├─ Home (HomeScreen)
      ├─ Practice (PracticeNavigator)
      └─ Profile (ProfileScreen)
```

### **Navigation Flow:**
1. App starts → `checkAuth` runs
2. If token found → Load user data → Show MainNavigator
3. If no token → Show AuthNavigator
4. After login → `navigation.reset()` to MainNavigator

---

## 🎯 Key Features Summary

### **✅ Implemented:**
1. Phone OTP Authentication (Twilio)
2. User Profile & Stats API
3. Home Dashboard with real data
4. AsyncStorage persistence
5. Redux state management
6. Navigation with SafeAreaView
7. Pull-to-refresh
8. Clean minimal UI

### **🚧 To Implement:**
1. Practice screens (Daily, Topic, Subject)
2. Test series screens
3. Tournament screens
4. Battle (1v1) screens
5. Wallet & Payments (Razorpay)
6. Content Marketplace
7. Social Feed
8. Push Notifications (FCM)
9. Creator Dashboard
10. Offline mode
11. Deep linking
12. Share functionality

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react-native": "0.73+",
    "@react-navigation/native": "^6.x",
    "@react-navigation/stack": "^6.x",
    "@react-navigation/bottom-tabs": "^6.x",
    "@reduxjs/toolkit": "^2.x",
    "react-redux": "^9.x",
    "axios": "^1.x",
    "@react-native-async-storage/async-storage": "^1.x",
    "react-native-safe-area-context": "^4.x",
    "react-native-gesture-handler": "^2.x",
    "socket.io-client": "^4.x"
  }
}
```

---

## 🚀 Getting Started

### **1. Install Dependencies**
```bash
cd AspirantHub
yarn install
cd ios && pod install
```

### **2. Start Backend**
```bash
cd backend
npm run dev
# Running on http://192.168.31.70:8080
```

### **3. Update API Base URL**
```typescript
// src/api/client.ts
const API_BASE_URL = 'http://YOUR_IP:8080'; // Update with your machine's IP
```

### **4. Run App**
```bash
# Android
yarn android

# iOS
yarn ios
```

---

## 🔧 Environment Configuration

### **Development:**
- API Base URL: Local IP (http://192.168.31.70:8080)
- Debug mode: Enabled
- Logs: Console logging active

### **Production:**
- API Base URL: Production server
- Debug mode: Disabled
- Logs: Error tracking (Sentry)
- Code Push: Enabled

---

## 📝 Code Snippets

### **Making API Calls**
```typescript
// In any screen
import userService from '../api/services/userService';

const fetchData = async () => {
  try {
    const stats = await userService.getStats();
    setData(stats);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **Using Redux**
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const { user, isAuthenticated } = useSelector((state) => state.auth);
const dispatch = useDispatch();

const handleLogout = () => {
  dispatch(logout());
};
```

### **Navigation**
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to screen
navigation.navigate('HomeScreen');

// Reset navigation stack
navigation.reset({
  index: 0,
  routes: [{ name: 'Main' }],
});
```

---

## 🎨 UI/UX Guidelines

### **Colors:**
```typescript
COLORS = {
  primary: '#6366F1',      // Indigo
  white: '#FFFFFF',
  black: '#000000',
  error: '#EF4444',
  success: '#10B981',
  gray: '#6B7280'
}
```

### **Spacing:**
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px

### **Typography:**
- Heading: 24px, Bold
- Subheading: 18px, SemiBold
- Body: 16px, Regular
- Caption: 14px, Regular
- Small: 12px, Regular

---

## 🐛 Debugging Tips

### **Common Issues:**

1. **Network Error:**
   - Check backend is running
   - Verify IP address in API client
   - Ensure phone and computer on same network

2. **Token Expired:**
   - Implement refresh token logic
   - Check token expiry time

3. **AsyncStorage Issues:**
   - Clear storage: `AsyncStorage.clear()`
   - Check data format (JSON.stringify/parse)

4. **Navigation Errors:**
   - Verify route names match
   - Check navigation stack structure

---

## 📊 Performance Optimization

1. **Use React.memo** for expensive components
2. **Lazy load** images
3. **Pagination** for long lists
4. **Cache API** responses
5. **Debounce** search inputs
6. **FlatList** instead of ScrollView for lists
7. **Image optimization** - WebP format
8. **Code splitting** - Dynamic imports

---

## 🔒 Security Best Practices

1. Store tokens in AsyncStorage (encrypted in production)
2. Never commit API keys
3. Use HTTPS in production
4. Implement token refresh
5. Validate all user inputs
6. Sanitize data before display
7. Implement rate limiting
8. Add request timeouts

---

## 📱 Platform-Specific Notes

### **Android:**
- OTP auto-read supported
- Push notifications via FCM
- Deep linking configured

### **iOS:**
- OTP auto-read requires SMS consent
- Push notifications via APNs
- App Store compliance

---

## 📚 Additional Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Navigation](https://reactnavigation.org/)
- [Backend API Docs](./BACKEND_ARCHITECTURE.md)

---

## 🤝 Contributing

1. Create feature branch
2. Follow coding standards
3. Write clean, documented code
4. Test thoroughly
5. Submit PR

---

## 📄 License

MIT License - See LICENSE file

---

**Last Updated:** January 25, 2026  
**Version:** 1.0.0  
**Author:** Development Team

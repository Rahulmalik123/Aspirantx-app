// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  VERIFY_OTP: '/api/v1/auth/verify-otp',
  RESEND_OTP: '/api/v1/auth/resend-otp',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  LOGOUT: '/api/v1/auth/logout',
  
  // OTP
  SEND_OTP_PHONE: '/api/v1/otp/send-phone',
  VERIFY_OTP_PHONE: '/api/v1/otp/verify-phone',
  RESEND_OTP_API: '/api/v1/otp/resend',
  COMPLETE_PROFILE: '/api/v1/otp/complete-profile',
  
  // User
  PROFILE: '/api/v1/users/profile',
  UPDATE_PROFILE: '/api/v1/users/profile',
  USER_STATS: '/api/v1/users/stats',
  UPDATE_AVATAR: '/api/v1/users/avatar',
  UPDATE_PREFERENCES: '/api/v1/users/preferences',
  SELECT_EXAMS: '/api/v1/users/exams',
  
  // Exams
  EXAM_CATEGORIES: '/api/v1/exams/public/categories',
  EXAMS: '/api/v1/exams',
  EXAM_DETAILS: (id: string) => `/api/v1/exams/public/details/${id}`,
  EXAM_SYLLABUS: (id: string) => `/api/v1/exams/${id}/syllabus`,
  COMMON_SYLLABUS: '/api/v1/exams/common-syllabus',
  
  // Subjects & Topics
  SUBJECTS: '/api/v1/public/subjects',
  TOPICS: (subjectId: string) => `/api/v1/subjects/${subjectId}/topics`,
  CONCEPTS: (topicId: string) => `/api/v1/topics/${topicId}/concepts`,
  
  // Practice
  DAILY_PRACTICE: '/api/v1/practice/daily',
  PRACTICE_HISTORY: '/api/v1/practice/history',
  BOOKMARKS: '/api/v1/practice/bookmarks',
  TOGGLE_BOOKMARK: (questionId: string) => `/api/v1/practice/bookmarks/${questionId}`,
  SUBMIT_PRACTICE: '/api/v1/practice/submit',
  
  // Analytics
  ANALYTICS_PERFORMANCE: '/api/v1/analytics/performance',
  ANALYTICS_SUBJECT: '/api/v1/analytics/subject',
  ANALYTICS_TOPIC: '/api/v1/analytics/topic',
  ANALYTICS_DIFFICULTY: '/api/v1/analytics/difficulty',
  ANALYTICS_PROGRESS: '/api/v1/analytics/progress',
  
  // Questions
  QUESTIONS: '/api/v1/questions',
  QUESTION_BANK: '/api/v1/questions/bank',
  REPORT_QUESTION: '/api/v1/questions/report',
  SUBMIT_ANSWER: '/api/v1/questions/submit',
  
  // Quiz
  QUIZ_MODES: '/api/v1/quiz/modes',
  START_QUIZ: '/api/v1/quiz/start',
  SUBMIT_QUIZ: '/api/v1/quiz/submit',
  QUIZ_RESULT: (quizId: string) => `/api/v1/quiz/${quizId}/result`,
  QUIZ_SOLUTIONS: (quizId: string) => `/api/v1/quiz/${quizId}/solutions`,
  QUIZ_HISTORY: '/api/v1/quiz/history',
  
  // PYQ (Previous Year Questions)
  PYQ_EXAMS: '/api/v1/pyq/exams',
  PYQ_YEARS: (examId: string) => `/api/v1/pyq/${examId}/years`,
  PYQ_QUESTIONS: '/api/v1/pyq/questions',
  PYQ_ANALYSIS: '/api/v1/pyq/analysis',
  PYQ_TRENDS: '/api/v1/pyq/trends',
  
  // Test Series
  TEST_SERIES: '/api/v1/tests',
  TEST_CATEGORIES: '/api/v1/tests/categories',
  TEST_DETAILS: (testId: string) => `/api/v1/tests/${testId}`,
  START_TEST: (testId: string) => `/api/v1/tests/${testId}/start`,
  SUBMIT_TEST: (testId: string) => `/api/v1/tests/${testId}/submit`,
  TEST_REPORT: (testId: string) => `/api/v1/tests/${testId}/report`,
  TEST_HISTORY: '/api/v1/tests/history',
  TEST_LEADERBOARD: (testId: string) => `/api/v1/tests/${testId}/leaderboard`,
  
  // Tournaments
  TOURNAMENTS: '/api/v1/tournaments',
  TOURNAMENT_DETAILS: (id: string) => `/api/v1/tournaments/details/${id}`,
  JOIN_TOURNAMENT: (id: string) => `/api/v1/tournaments/join/${id}`,
  TOURNAMENT_LEADERBOARD: (id: string) => `/api/v1/tournaments/leaderboard/${id}`,
  MY_TOURNAMENTS: '/api/v1/tournaments/my-tournaments',
  
  // Battles
  AVAILABLE_BATTLES: '/api/v1/battles/available',
  CREATE_BATTLE: '/api/v1/battles/create',
  JOIN_BATTLE: (id: string) => `/api/v1/battles/join/${id}`,
  JOIN_BATTLE_BY_CODE: (code: string) => `/api/v1/battles/join-by-code/${code}`,
  BATTLE_DETAILS: (id: string) => `/api/v1/battles/${id}`,
  SUBMIT_BATTLE_ANSWER: (id: string) => `/api/v1/battles/${id}/answer`,
  BATTLE_RESULT: (id: string) => `/api/v1/battles/results/${id}`,
  MY_BATTLES: '/api/v1/battles/my-battles',
  PENDING_CHALLENGES: '/api/v1/battles/pending-challenges',
  DECLINE_CHALLENGE: (id: string) => `/api/v1/battles/${id}/decline`,
  
  // Wallet
  WALLET: '/api/v1/wallet',
  WALLET_RECHARGE: '/api/v1/wallet/recharge',
  WALLET_VERIFY: '/api/v1/wallet/verify-payment',
  TRANSACTIONS: '/api/v1/wallet/transactions',
  EARNINGS: '/api/v1/wallet/earnings',
  WITHDRAW: '/api/v1/wallet/withdraw',
  COIN_PACKAGES: '/api/v1/wallet/packages',
  
  // Payments
  CREATE_ORDER: '/api/v1/payments/create-order',
  VERIFY_PAYMENT: '/api/v1/payments/verify',
  PAYMENT_HISTORY: '/api/v1/payments/history',
  
  // Content Store & Marketplace
  CONTENT: '/api/v1/content',
  CONTENT_CATEGORIES: '/api/v1/content/categories',
  CONTENT_DETAILS: (id: string) => `/api/v1/content/details/${id}`,
  PURCHASE_CONTENT: (id: string) => `/api/v1/content/purchase/${id}`,
  MY_PURCHASES: '/api/v1/content/my-purchases',
  DOWNLOAD_CONTENT: (purchaseId: string) => `/api/v1/content/download/${purchaseId}`,
  ADD_REVIEW: (contentId: string) => `/api/v1/content/review/${contentId}`,
  TRACK_VIEW: (contentId: string) => `/api/v1/content/view/${contentId}`,
  MY_CONTENT: '/api/v1/content/my',
  BUNDLES: '/api/v1/content/bundles',
  
  // Creator Marketplace
  BECOME_CREATOR: '/api/v1/creator/register',
  CREATOR_PROFILE: '/api/v1/creator/profile',
  CREATOR_DASHBOARD: '/api/v1/creator/dashboard',
  UPLOAD_CONTENT: '/api/v1/creator/content',
  MY_UPLOADS: '/api/v1/creator/content',
  UPDATE_CONTENT: (contentId: string) => `/api/v1/creator/content/${contentId}`,
  DELETE_CONTENT: (contentId: string) => `/api/v1/creator/content/${contentId}`,
  CREATOR_EARNINGS: '/api/v1/creator/earnings',
  PAYOUT_REQUEST: '/api/v1/creator/payout/request',
  PAYOUT_HISTORY: '/api/v1/creator/payouts',
  BANK_DETAILS: '/api/v1/creator/bank-details',
  TOP_CONTENT: '/api/v1/creator/analytics/top-content',
  CREATOR_ANALYTICS: '/api/v1/creator/analytics',
  
  // Social Feed
  FEED: '/api/v1/social/feed',
  CREATE_POST: '/api/v1/social/posts',
  POST_DETAILS: (id: string) => `/api/v1/social/posts/${id}`,
  LIKE_POST: (id: string) => `/api/v1/social/posts/${id}/like`,
  COMMENT_POST: (id: string) => `/api/v1/social/posts/${id}/comment`,
  DELETE_POST: (id: string) => `/api/v1/social/posts/${id}`,
  REPORT_POST: (id: string) => `/api/v1/social/posts/${id}/report`,
  USER_PROFILE: (userId: string) => `/api/v1/social/users/${userId}`,
  FOLLOW_USER: (userId: string) => `/api/v1/social/users/${userId}/follow`,
  FOLLOWERS: (userId: string) => `/api/v1/social/users/${userId}/followers`,
  FOLLOWING: (userId: string) => `/api/v1/social/users/${userId}/following`,
  USER_POSTS: (userId: string) => `/api/v1/social/posts/user/${userId}`,
  
  // Referral
  REFERRAL_CODE: '/api/v1/referral/code',
  REFERRAL_STATS: '/api/v1/referral/stats',
  APPLY_REFERRAL: '/api/v1/referral/apply',
  
  // Notifications
  NOTIFICATIONS: '/api/v1/notifications',
  MARK_READ: (id: string) => `/api/v1/notifications/${id}/read`,
  MARK_BROADCAST_READ: (id: string) => `/api/v1/notifications/broadcast/${id}/read`,
  MARK_ALL_READ: '/api/v1/notifications/read-all',
  NOTIFICATION_SETTINGS: '/api/v1/notifications/settings',
  DELETE_NOTIFICATION: (id: string) => `/api/v1/notifications/${id}`,
  
  // Analytics
  USER_ANALYTICS: '/api/v1/analytics/user',
  PERFORMANCE: '/api/v1/analytics/performance',
  SUBJECT_PROGRESS: '/api/v1/analytics/subjects',
  COMPARE_ANALYTICS: '/api/v1/analytics/compare',
  
  // Badges & Achievements
  BADGES: '/api/v1/badges',
  ACHIEVEMENTS: '/api/v1/achievements',
  USER_BADGES: '/api/v1/users/badges',
  
  // Saved Content
  SAVED_CONTENT: '/api/v1/saved-content',
  SAVED_CONTENT_COUNT: '/api/v1/saved-content/count',
  SAVED_CONTENT_FOLDERS: '/api/v1/saved-content/folders',
  SAVED_CONTENT_CHECK: '/api/v1/saved-content/check',
  SAVED_CONTENT_UNSAVE: '/api/v1/saved-content/unsave',
  SAVED_CONTENT_ITEM: (id: string) => `/api/v1/saved-content/${id}`,
};

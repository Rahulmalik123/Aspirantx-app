import apiClient from '../client';

export interface Test {
  _id: string;
  title: string;
  description: string;
  exam: string;
  type: 'mock_test' | 'topic_test' | 'daily_quiz' | 'pyq' | 'subject_test';
  difficulty?: 'easy' | 'medium' | 'hard';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarkingRatio?: string;
  sections?: Array<{
    name: string;
    subjectId?: string;
    topicId?: string;
    questions: number;
    duration?: number;
  }>;
  isPaid: boolean;
  price: number;
  totalAttempts: number;
  averageScore?: number;
  userAttempted?: boolean;
  userPurchased?: boolean;
  isActive: boolean;
  attemptId?: string;
  canRetake?: boolean;
  attemptInfo?: {
    isAttempted: boolean;
    canRetake: boolean;
    attemptId?: string;
  };
}

export interface TestAttempt {
  _id: string;
  test: string;
  user: string;
  answers: Array<{
    question: string;
    selectedOption: number;
    isCorrect: boolean;
    timeTaken: number;
  }>;
  score: number;
  percentage: number;
  timeTaken: number;
  completedAt: string;
}

const testService = {
  // Get all tests for an exam
  // API: GET /api/v1/tests/exam/{examId}
  getTests: async (examId?: string, type?: string) => {
    if (examId) {
      const params = type ? { type } : {};
      const response = await apiClient.get(`/api/v1/tests/exam/${examId}`, { params });
      return response.data;
    } else {
      // If no examId, get all tests
      const params = type ? { type } : {};
      const response = await apiClient.get(`/api/v1/tests`, { params });
      return response.data;
    }
  },

  // Get test details
  // API: GET /api/v1/tests/{testId}
  getTestDetails: async (testId: string) => {
    const response = await apiClient.get(`/api/v1/tests/${testId}`);
    return response.data;
  },

  // Purchase test
  // API: POST /api/v1/payments/purchase
  purchaseTest: async (testId: string) => {
    const response = await apiClient.post(`/api/v1/payments/purchase`, {
      itemType: 'test',
      itemId: testId,
    });
    return response.data;
  },

  // Start test attempt
  // API: POST /api/v1/tests/:testId/start
  startTest: async (testId: string) => {
    const response = await apiClient.post(`/api/v1/tests/${testId}/start`);
    return response.data;
  },

  // Submit test
  // API: POST /api/v1/tests/submit/{attemptId}
  submitTest: async (attemptId: string, answers: any[]) => {
    const response = await apiClient.post(`/api/v1/tests/submit/${attemptId}`, { 
      answers 
    });
    return response.data;
  },

  // Save answer during test
  // API: POST /api/v1/tests/attempts/{attemptId}/answer
  saveAnswer: async (attemptId: string, questionId: string, selectedAnswer: number, timeTaken: number) => {
    const response = await apiClient.post(`/api/v1/tests/attempts/${attemptId}/answer`, {
      questionId,
      selectedAnswer,
      timeTaken,
    });
    return response.data;
  },

  // Get test result
  // API: GET /api/v1/tests/results/{attemptId}
  getTestResult: async (attemptId: string) => {
    const response = await apiClient.get(`/api/v1/tests/results/${attemptId}`);
    return response.data;
  },

  // Get test review/solutions
  // API: GET /api/v1/tests/attempts/{attemptId}/review
  getTestReview: async (attemptId: string) => {
    const response = await apiClient.get(`/api/v1/tests/attempts/${attemptId}/review`);
    return response.data;
  },

  // Get test leaderboard
  // API: GET /api/v1/tests/{testId}/leaderboard
  getTestLeaderboard: async (testId: string, page: number = 1, limit: number = 50) => {
    const response = await apiClient.get(`/api/v1/tests/${testId}/leaderboard`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get user's test attempts
  // API: GET /api/v1/tests/{testId}/attempts
  getAttempts: async (testId: string) => {
    const response = await apiClient.get(`/api/v1/tests/${testId}/attempts`);
    return response.data;
  },

  // Get attempt details
  // API: GET /api/v1/tests/attempts/{attemptId}
  getAttemptDetails: async (attemptId: string) => {
    const response = await apiClient.get(`/api/v1/tests/attempts/${attemptId}`);
    return response.data;
  },

  // Get test history
  // API: GET /api/v1/tests/history/me?status={status}
  getTestHistory: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/v1/tests/history/me', { params });
    return response.data;
  },
};

export default testService;

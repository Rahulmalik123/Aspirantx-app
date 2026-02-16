import apiClient from '../client';
import {
  Subject,
  Topic,
  SubjectTest,
  TestAttempt,
  TestResult,
  TestAnalysis,
  UserTestHistory,
  SubmitAnswer,
  PaginatedResponse,
  ApiResponse,
} from '../../types/subject.types';

const subjectService = {
  // Get all subjects for an exam
  // API: GET /api/v1/subjects?examId={examId}
  getSubjects: async (examId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Subject>> => {
    const response = await apiClient.get('/api/v1/subjects', {
      params: { examId, page, limit },
    });
    return response.data;
  },

  // Get topics for a subject
  // API: GET /api/v1/topics?subjectId={subjectId}
  getTopics: async (subjectId: string, examId?: string): Promise<PaginatedResponse<Topic>> => {
    const params: any = { subjectId };
    if (examId) params.examId = examId;
    
    const response = await apiClient.get('/api/v1/topics', { params });
    return response.data;
  },

  // Get all subject tests (filter by subject)
  // API: GET /api/v1/tests?type=subject_test&examId={examId}&subjectId={subjectId}
  getSubjectTests: async (
    examId?: string,
    subjectId?: string,
    isActive: boolean = true,
    isPaid?: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<SubjectTest>> => {
    const params: any = {
      type: 'subject_test',
      page,
      limit,
    };
    
    if (examId) params.examId = examId;
    if (subjectId) params.subjectId = subjectId;
    if (isActive !== undefined) params.isActive = isActive;
    if (isPaid !== undefined) params.isPaid = isPaid;
    
    const response = await apiClient.get('/api/v1/tests', { params });
    return response.data;
  },

  // Get test details before starting
  // API: GET /api/v1/tests/{testId}
  getTestDetails: async (testId: string): Promise<ApiResponse<SubjectTest>> => {
    const response = await apiClient.get(`/api/v1/tests/${testId}`);
    return response.data;
  },

  // Start test and get questions
  // API: POST /api/v1/tests/start/{testId}
  startTest: async (testId: string): Promise<ApiResponse<TestAttempt>> => {
    const response = await apiClient.post(`/api/v1/tests/start/${testId}`);
    return response.data;
  },

  // Submit test with answers
  // API: POST /api/v1/tests/submit/{attemptId}
  submitTest: async (attemptId: string, answers: SubmitAnswer[]): Promise<ApiResponse<TestResult>> => {
    const response = await apiClient.post(`/api/v1/tests/submit/${attemptId}`, {
      answers,
    });
    return response.data;
  },

  // Get test results and analysis
  // API: GET /api/v1/tests/results/{attemptId}
  getTestResults: async (attemptId: string): Promise<ApiResponse<TestAnalysis>> => {
    const response = await apiClient.get(`/api/v1/tests/results/${attemptId}`);
    return response.data;
  },

  // Get user's test history
  // API: GET /api/v1/tests/my-attempts?type=subject_test&status={status}
  getMyAttempts: async (
    testId?: string,
    status?: 'completed' | 'in_progress' | 'abandoned',
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<UserTestHistory>> => {
    const params: any = {
      type: 'subject_test',
      page,
      limit,
    };
    
    if (testId) params.testId = testId;
    if (status) params.status = status;
    
    const response = await apiClient.get('/api/v1/tests/my-attempts', { params });
    return response.data;
  },

  // Purchase test (if paid)
  // API: POST /api/v1/payments/purchase
  purchaseTest: async (testId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/api/v1/payments/purchase', {
      itemType: 'test',
      itemId: testId,
    });
    return response.data;
  },

  // Get test leaderboard
  // API: GET /api/v1/tests/{testId}/leaderboard
  getTestLeaderboard: async (testId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get(`/api/v1/tests/${testId}/leaderboard`, {
      params: { page, limit },
    });
    return response.data;
  },
};

export default subjectService;

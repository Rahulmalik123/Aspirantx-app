import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Subject {
  _id: string;
  name: string;
  icon?: string;
  topicCount: number;
  questionCount: number;
  progress?: number;
}

export interface Topic {
  _id: string;
  name: string;
  subjectId: string;
  conceptCount: number;
  questionCount: number;
  progress?: number;
}

export interface DailyPractice {
  questions: any[];
  date: Date;
  completed: boolean;
}

export interface WeakConcept {
  conceptId: string;
  conceptName: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

class PracticeService {
  async getSubjects(examId?: string): Promise<Subject[]> {
    const params = examId ? { examId } : {};
    return apiClient.get(ENDPOINTS.SUBJECTS, { params });
  }

  async getTopics(subjectId: string): Promise<Topic[]> {
    return apiClient.get(ENDPOINTS.TOPICS(subjectId));
  }

  async getDailyPractice(examId?: string): Promise<any> {
    const url = examId 
      ? `/api/v1/practice/daily/${examId}`
      : '/api/v1/practice/daily';
    return apiClient.get(url);
  }

  // Get daily quiz history (with includeHistory flag)
  async getDailyPracticeHistory(includeHistory: boolean = false): Promise<any> {
    const response = await apiClient.get('/api/v1/users/daily-quizzes', {
      params: { includeHistory: includeHistory ? 'true' : 'false' }
    });
    return response;
  }

  // Get today's quizzes only (pending/in_progress)
  async getTodayQuizzes(): Promise<any> {
    const response = await apiClient.get('/api/v1/quiz-banks/daily/today');
    return response;
  }

  // Get single daily quiz with questions
  async getDailyQuiz(quizId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/quiz-banks/daily/${quizId}`);
    return response;
  }

  // Submit daily quiz
  async submitDailyQuiz(quizId: string, userAnswers: any[]): Promise<any> {
    const response = await apiClient.post(`/api/v1/quiz-banks/daily/${quizId}/complete`, {
      userAnswers
    });
    return response;
  }

  async submitDailyPractice(practiceId: string, answers: any[]): Promise<any> {
    return apiClient.post(`/api/v1/practice/daily/${practiceId}/submit`, { answers });
  }

  async getQuestionsByTopic(topicId: string, limit: number = 10, difficulty?: string, type?: string): Promise<any> {
    const params: any = { limit };
    if (difficulty) params.difficulty = difficulty;
    if (type) params.type = type;
    return apiClient.get(`/api/v1/practice/topic/${topicId}`, { params });
  }

  async getQuestionsBySubject(subjectId: string, limit: number = 10, difficulty?: string): Promise<any> {
    const params: any = { limit };
    if (difficulty) params.difficulty = difficulty;
    return apiClient.get(`/api/v1/practice/subject/${subjectId}`, { params });
  }

  async getRandomQuestions(examId: string, count: number = 10, difficulty?: string, subjectId?: string): Promise<any> {
    const params: any = { count };
    if (difficulty) params.difficulty = difficulty;
    if (subjectId) params.subjectId = subjectId;
    return apiClient.get(`/api/v1/practice/random/${examId}`, { params });
  }

  async getPYQs(examId: string, year?: number, shift?: string, page: number = 1, limit: number = 20): Promise<any> {
    const params: any = { page, limit };
    if (year) params.year = year;
    if (shift) params.shift = shift;
    return apiClient.get(`/api/v1/practice/pyq/${examId}`, { params });
  }

  async getQuestionsByConcept(conceptId: string, limit: number = 20, difficulty?: string, page: number = 1): Promise<any> {
    const params: any = { limit, page };
    if (difficulty) params.difficulty = difficulty;
    return apiClient.get(`/api/v1/practice/concept/${conceptId}`, { params });
  }

  async getWeakConcepts(limit: number = 10): Promise<WeakConcept[]> {
    return apiClient.get('/api/v1/practice/weak-concepts', { params: { limit } });
  }

  async getPracticeHistory(): Promise<any[]> {
    return apiClient.get(ENDPOINTS.PRACTICE_HISTORY);
  }

  async getBookmarks(): Promise<any[]> {
    return apiClient.get(ENDPOINTS.BOOKMARKS);
  }

  async toggleBookmark(questionId: string): Promise<{ success: boolean; isBookmarked: boolean }> {
    return apiClient.post(ENDPOINTS.TOGGLE_BOOKMARK(questionId));
  }

  async submitAnswer(questionId: string, answer: string): Promise<{ isCorrect: boolean; explanation?: string }> {
    return apiClient.post(ENDPOINTS.SUBMIT_ANSWER, { questionId, answer });
  }
}

export default new PracticeService();

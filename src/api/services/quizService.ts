import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Question {
  _id: string;
  text: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  topic: string;
}

export interface QuizConfig {
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  numberOfQuestions: number;
  timeLimit?: number;
  mode: string;
}

export interface QuizResult {
  _id: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  accuracy: number;
}

class QuizService {
  async startQuiz(config: QuizConfig): Promise<{ quizId: string; questions: Question[] }> {
    return apiClient.post(ENDPOINTS.START_QUIZ, config);
  }

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<QuizResult> {
    return apiClient.post(ENDPOINTS.SUBMIT_QUIZ, { quizId, answers });
  }

  async getQuizResult(quizId: string): Promise<QuizResult> {
    return apiClient.get(ENDPOINTS.QUIZ_RESULT(quizId));
  }

  async getQuizSolutions(quizId: string): Promise<any> {
    return apiClient.get(ENDPOINTS.QUIZ_SOLUTIONS(quizId));
  }

  async getQuizHistory(): Promise<QuizResult[]> {
    return apiClient.get(ENDPOINTS.QUIZ_HISTORY);
  }
}

export default new QuizService();

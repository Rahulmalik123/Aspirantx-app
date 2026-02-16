import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Exam {
  _id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

export interface ExamCategory {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  examCount: number;
}

class ExamService {
  async getCategories(): Promise<any> {
    return apiClient.get('/api/v1/exams/public/categories');
  }

  async getExamsByCategory(categoryId: string): Promise<any> {
    return apiClient.get(`/api/v1/exams/public/category/${categoryId}`);
  }

  async getExamDetails(examId: string): Promise<any> {
    return apiClient.get(`/api/v1/exams/public/details/${examId}`);
  }

  async getExams(category?: string): Promise<Exam[]> {
    const params = category ? { category } : {};
    return apiClient.get(ENDPOINTS.EXAMS, { params });
  }

  async getExamSyllabus(examId: string): Promise<any> {
    return apiClient.get(ENDPOINTS.EXAM_SYLLABUS(examId));
  }

  async getCommonSyllabus(examIds: string[]): Promise<any> {
    return apiClient.post(ENDPOINTS.COMMON_SYLLABUS, { examIds });
  }
}

export default new ExamService();

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  selectedExams: Array<{
    _id: string;
    name: string;
    category: string;
  }>;
  coins: number;
  level: number;
  experience: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    streak: number;
  };
  isCreator?: boolean;
  creatorProfile?: {
    bio: string;
    expertise: string[];
    totalContentSold: number;
    totalEarnings: number;
    rating: number;
    totalReviews: number;
    isVerified: boolean;
  };
}

export interface DashboardStats {
  stats: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    totalTests: number;
    completedTests: number;
    accuracy: number;
  };
  gamification: {
    coins: number;
    level: number;
    experience: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  primaryExam?: string;
  targetExams?: string[];
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  state?: string;
  city?: string;
}

export interface LeaderboardUser {
  _id: string;
  name: string;
  avatar?: string;
  level: number;
  experience: number;
  rank: number;
  stats: {
    accuracy: number;
    totalQuestions: number;
  };
  currentStreak: number;
}

export interface LeaderboardResponse {
  data: LeaderboardUser[];
  currentUser?: LeaderboardUser;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    return apiClient.get(ENDPOINTS.PROFILE);
  }

  async getStats(): Promise<DashboardStats> {
    return apiClient.get(ENDPOINTS.USER_STATS);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return apiClient.put(ENDPOINTS.UPDATE_PROFILE, data);
  }

  async selectExams(examIds: string[]): Promise<{ success: boolean }> {
    return apiClient.post(ENDPOINTS.SELECT_EXAMS, { examIds });
  }

  async uploadAvatar(formData: FormData): Promise<{ avatar: string }> {
    return apiClient.post(ENDPOINTS.UPDATE_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getUserById(userId: string): Promise<any> {
    return apiClient.get(`/api/v1/users/${userId}`);
  }

  async getLeaderboard(params?: {
    page?: number;
    limit?: number;
    type?: 'global' | 'exam';
    examId?: string;
  }): Promise<LeaderboardResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.examId) queryParams.append('examId', params.examId);
    
    return apiClient.get(`/api/v1/users/leaderboard?${queryParams.toString()}`);
  }
}

export default new UserService();

import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface SocialPost {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    karma: number;
  };
  content: string;
  images?: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: Date;
}

export interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  text: string;
  likes: number;
  createdAt: Date;
}

class SocialService {
  async getFeed(page = 1, limit = 10): Promise<{ posts: SocialPost[]; total: number }> {
    return apiClient.get(ENDPOINTS.FEED, { params: { page, limit } });
  }

  async createPost(content: string, images?: string[]): Promise<SocialPost> {
    return apiClient.post(ENDPOINTS.CREATE_POST, { content, images });
  }

  async getPostDetails(postId: string): Promise<SocialPost> {
    return apiClient.get(ENDPOINTS.POST_DETAILS(postId));
  }

  async likePost(postId: string): Promise<{ success: boolean }> {
    return apiClient.post(ENDPOINTS.LIKE_POST(postId));
  }

  async commentOnPost(postId: string, text: string): Promise<Comment> {
    return apiClient.post(ENDPOINTS.COMMENT_POST(postId), { text });
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    return apiClient.delete(ENDPOINTS.DELETE_POST(postId));
  }

  async getUserProfile(userId: string): Promise<any> {
    return apiClient.get(ENDPOINTS.USER_PROFILE(userId));
  }

  async followUser(userId: string): Promise<{ success: boolean }> {
    return apiClient.post(ENDPOINTS.FOLLOW_USER(userId));
  }

  async getFollowers(userId: string): Promise<any[]> {
    return apiClient.get(ENDPOINTS.FOLLOWERS(userId));
  }

  async getFollowing(userId: string): Promise<any[]> {
    return apiClient.get(ENDPOINTS.FOLLOWING(userId));
  }

  async getUserPosts(userId: string, page = 1, limit = 20): Promise<any> {
    return apiClient.get(ENDPOINTS.USER_POSTS(userId), { params: { page, limit } });
  }
}

export default new SocialService();

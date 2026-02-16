import apiClient from '../client';
import { 
  CreatePostRequest 
} from '../../types/social.types';

export const socialService = {
  // Get feed posts
  getFeed: async (page: number = 1, limit: number = 10): Promise<any> => {
    return apiClient.get(`/api/v1/social/feed?page=${page}&limit=${limit}`);
  },

  // Get single post
  getPost: async (postId: string): Promise<any> => {
    return apiClient.get(`/api/v1/social/posts/${postId}`);
  },

  // Create a new post
  createPost: async (postData: CreatePostRequest): Promise<any> => {
    return apiClient.post('/api/v1/social/posts', postData);
  },

  // Update post
  updatePost: async (postId: string, postData: { content: string; hashtags?: string[]; images?: string[] }): Promise<any> => {
    return apiClient.put(`/api/v1/social/posts/${postId}`, postData);
  },

  // Delete post
  deletePost: async (postId: string): Promise<any> => {
    return apiClient.delete(`/api/v1/social/posts/${postId}`);
  },

  // Like a post
  likePost: async (postId: string): Promise<any> => {
    return apiClient.post(`/api/v1/social/posts/${postId}/like`);
  },

  // Share post
  sharePost: async (postId: string): Promise<any> => {
    return apiClient.post(`/api/v1/social/posts/${postId}/share`);
  },

  // Vote on poll
  voteOnPoll: async (postId: string, optionIndex: number): Promise<any> => {
    return apiClient.post(`/api/v1/social/posts/${postId}/vote`, { optionIndex });
  },

  // Add comment to post
  addComment: async (postId: string, data: { content: string; parentId?: string }): Promise<any> => {
    // Backend uses 'replyTo' field, so we need to map parentId to replyTo
    const payload = {
      content: data.content,
      replyTo: data.parentId,
    };
    return apiClient.post(`/api/v1/social/posts/${postId}/comment`, payload);
  },

  // Get post comments
  getComments: async (postId: string): Promise<any> => {
    return apiClient.get(`/api/v1/social/posts/${postId}/comments`);
  },

  // Like comment
  likeComment: async (commentId: string): Promise<any> => {
    return apiClient.post(`/api/v1/social/comments/${commentId}/like`);
  },

  // Delete comment
  deleteComment: async (postId: string, commentId: string): Promise<any> => {
    return apiClient.delete(`/api/v1/social/comments/${commentId}`);
  },

  // Get user posts
  getUserPosts: async (userId: string): Promise<any> => {
    return apiClient.get(`/api/v1/social/posts/user/${userId}`);
  },

  // Follow/unfollow user
  followUser: async (targetUserId: string): Promise<any> => {
    return apiClient.post(`/api/v1/social/follow/${targetUserId}`);
  },

  // Unfollow user
  unfollowUser: async (targetUserId: string): Promise<any> => {
    return apiClient.delete(`/api/v1/social/follow/${targetUserId}`);
  },
};

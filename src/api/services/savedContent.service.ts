import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface SavedContentItem {
  _id: string;
  user: string;
  contentType: 'post' | 'test' | 'pdf';
  post?: any;
  test?: any;
  pdf?: any;
  tags?: string[];
  folder: string;
  notes?: string;
  savedAt: string;
  lastAccessedAt?: string;
  accessCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SaveContentPayload {
  contentType: 'post' | 'test' | 'pdf';
  contentId: string;
  folder?: string;
  tags?: string[];
  notes?: string;
}

export interface UnsaveContentPayload {
  contentType: 'post' | 'test' | 'pdf';
  contentId: string;
}

export interface CheckSavedPayload {
  contentType: 'post' | 'test' | 'pdf';
  contentId: string;
}

export interface UpdateSavedContentPayload {
  notes?: string;
  tags?: string[];
  folder?: string;
}

export interface SavedContentResponse {
  success: boolean;
  data: SavedContentItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SavedContentCountResponse {
  success: boolean;
  data: {
    total: number;
    posts: number;
    tests: number;
    pdfs: number;
  };
}

export interface FoldersResponse {
  success: boolean;
  data: Array<{
    name: string;
    count: number;
  }>;
}

export interface CheckSavedResponse {
  success: boolean;
  isSaved: boolean;
}

class SavedContentService {
  /**
   * Save content (post, test, or PDF)
   */
  async saveContent(payload: SaveContentPayload) {
    try {
      const response = await apiClient.post(ENDPOINTS.SAVED_CONTENT, payload);
      return response;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Unsave content by content ID and type
   */
  async unsaveContent(payload: UnsaveContentPayload) {
    try {
      const response = await apiClient.delete(ENDPOINTS.SAVED_CONTENT_UNSAVE, {
        data: payload,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Remove saved content by saved content ID
   */
  async removeSavedContent(savedContentId: string) {
    try {
      const response = await apiClient.delete(ENDPOINTS.SAVED_CONTENT_ITEM(savedContentId));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get all saved content with filters
   */
  async getSavedContent(params?: {
    contentType?: 'post' | 'test' | 'pdf';
    folder?: string;
    page?: number;
    limit?: number;
  }): Promise<SavedContentResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.SAVED_CONTENT, { params });
      console.log('Service getSavedContent - response:', response);
      console.log('Service getSavedContent - response.data:', response.data);
      return response as any;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get saved content count by type
   */
  async getSavedContentCount(): Promise<SavedContentCountResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.SAVED_CONTENT_COUNT);
      console.log('Service getSavedContentCount - response:', response);
      console.log('Service getSavedContentCount - response.data:', response.data);
      return response as any;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Get saved content folders
   */
  async getFolders(): Promise<FoldersResponse> {
    try {
      const response = await apiClient.get(ENDPOINTS.SAVED_CONTENT_FOLDERS);
      return response as any;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  /**
   * Check if content is saved
   */
  async checkIfSaved(payload: CheckSavedPayload): Promise<CheckSavedResponse> {
    try {
      const response = await apiClient.post(ENDPOINTS.SAVED_CONTENT_CHECK, payload);
      console.log('Service checkIfSaved raw response:', response);
      return response as any;
    } catch (error: any) {
      console.error('Service checkIfSaved error:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Update saved content (notes, tags, folder)
   */
  async updateSavedContent(savedContentId: string, payload: UpdateSavedContentPayload) {
    try {
      const response = await apiClient.put(ENDPOINTS.SAVED_CONTENT_ITEM(savedContentId), payload);
      return response as any;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }
}

export const savedContentService = new SavedContentService();

import apiClient from '../client';

export interface Banner {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkType?: 'practice' | 'exam' | 'tournament' | 'external' | 'none';
  linkId?: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerResponse {
  success: boolean;
  data: Banner[];
  message?: string;
}

class BannerService {
  /**
   * Get all active banners
   */
  async getActiveBanners(): Promise<Banner[]> {
    try {
      const response = await apiClient.get<BannerResponse>('/api/v1/banners/active');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ [BannerService] Failed to fetch active banners:', error);
      // Return empty array on error to show default content
      return [];
    }
  }

  /**
   * Get banner by ID
   */
  async getBannerById(bannerId: string): Promise<Banner | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Banner }>(`/api/v1/banners/${bannerId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ [BannerService] Failed to fetch banner:', error);
      return null;
    }
  }

  /**
   * Track banner click/impression
   */
  async trackBannerClick(bannerId: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/banners/${bannerId}/track`, { action: 'click' });
    } catch (error) {
      console.error('❌ [BannerService] Failed to track banner click:', error);
    }
  }
}

export default new BannerService();

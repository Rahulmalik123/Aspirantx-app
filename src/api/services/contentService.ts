import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Content {
  _id: string;
  title: string;
  description: string;
  contentType: 'pdf' | 'video' | 'ebook' | 'notes' | 'practice_set';
  type?: 'pdf' | 'ebook' | 'notes'; // Legacy support
  thumbnail?: string;
  previewUrl?: string; // Preview PDF for non-purchased users
  samplePages?: number[]; // Page numbers available as preview
  pricing?: {
    originalPrice: number;
    currency: string;
  };
  price?: number; // Legacy support
  isFree: boolean;
  averageRating: number;
  rating?: number; // Legacy support
  totalReviews: number;
  reviewCount?: number; // Legacy support
  totalSales: number;
  purchaseCount?: number; // Legacy support
  downloads?: number; // Legacy support
  totalViews: number;
  totalDownloads: number;
  exam?: {
    _id: string;
    name: string;
  };
  targetExams?: any[];
  examCategories?: any[];
  category?: string; // Legacy support
  tags?: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    creatorProfile?: {
      rating: number;
      totalContentSold: number;
    };
  };
  creator?: { // Legacy support
    _id: string;
    name: string;
    avatar?: string;
    creatorProfile?: {
      rating: number;
      totalContentSold: number;
    };
  };
  isPurchased?: boolean;
  isActive: boolean;
  isApproved: boolean;
  isFeatured: boolean;
  isOfficial: boolean;
  isCommonContent: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentDetails extends Content {
  files: Array<{
    url: string;
    size: number;
    format: string;
  }>;
  previewUrl?: string; // Preview PDF URL
  samplePages?: number[];
  tags: string[];
  reviews: Array<{
    _id: string;
    user: {
      name: string;
      profilePic?: string;
    };
    rating: number;
    review: string;
    isVerifiedPurchase: boolean;
    createdAt: string;
  }>;
  // Additional details fields
  topicIds?: any[];
  contentFor?: any[];
}

export interface Purchase {
  _id: string;
  content: Content;
  price: number;
  finalPrice: number;
  downloadCount: number;
  purchasedAt: string;
  lastDownloadedAt?: string;
}

export interface Bundle {
  _id: string;
  name: string;
  description: string;
  contents: string[];
  price: number;
  discount: number;
  thumbnail?: string;
}

class ContentService {
  // Get all marketplace content
  async getContents(filters?: {
    examId?: string;
    type?: string;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Content[]; pagination: any }> {
    return apiClient.get(ENDPOINTS.CONTENT, { params: filters });
  }

  async getContentCategories(): Promise<any[]> {
    return apiClient.get(ENDPOINTS.CONTENT_CATEGORIES);
  }

  // Get content details
  async getContentDetails(contentId: string): Promise<{ content: ContentDetails; reviews: any[] }> {
    return apiClient.get(ENDPOINTS.CONTENT_DETAILS(contentId));
  }

  // Purchase content
  async purchaseContent(contentId: string, referralCode?: string): Promise<{ success: boolean; purchase: Purchase }> {
    return apiClient.post(`/content/purchase/${contentId}`, { referralCode });
  }

  // Get my purchases
  async getMyPurchases(): Promise<Purchase[]> {
    return apiClient.get('/content/my-purchases');
  }

  // Download content
  async downloadContent(purchaseId: string): Promise<{
    purchaseId: string;
    contentTitle: string;
    downloadLinks: Array<{
      url: string;
      filename: string;
      size: number;
      expiresAt: string;
    }>;
    downloadCount: number;
  }> {
    return apiClient.get(`/content/download/${purchaseId}`);
  }

  // Add review
  async addReview(contentId: string, rating: number, review: string): Promise<any> {
    return apiClient.post(`/content/review/${contentId}`, { rating, review });
  }

  // Track view
  async trackView(contentId: string): Promise<any> {
    return apiClient.post(ENDPOINTS.TRACK_VIEW(contentId));
  }

  async getMyContent(): Promise<Content[]> {
    const response = await apiClient.get(ENDPOINTS.MY_CONTENT);
    // The API returns { success, message, data: { data: [], pagination: {} } }
    // apiClient already unwraps to response.data, so we get { data: [], pagination: {} }
    // We need to access response.data.data to get the actual array
    return response?.data?.data || [];
  }

  async getBundles(): Promise<Bundle[]> {
    return apiClient.get(ENDPOINTS.BUNDLES);
  }

  // Update content
  async updateContent(contentId: string, updateData: any): Promise<Content> {
    return apiClient.put(ENDPOINTS.UPDATE_CONTENT(contentId), updateData);
  }

  // Delete content
  async deleteContent(contentId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete(ENDPOINTS.DELETE_CONTENT(contentId));
  }
}

export default new ContentService();

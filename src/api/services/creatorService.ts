import apiClient from '../client';

export interface CreatorProfile {
  bio: string;
  expertise: string[];
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  totalContentSold: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch?: string;
  upiId?: string;
}

export interface CreatorContent {
  _id: string;
  title: string;
  contentType: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  price: number;
  totalSales: number;
  totalRevenue: number;
  totalViews: number;
  averageRating: number;
  createdAt: string;
}

export interface Earning {
  _id: string;
  content: {
    _id: string;
    title: string;
  };
  saleAmount: number;
  platformCommission: number;
  creatorEarning: number;
  status: 'pending' | 'paid' | 'cancelled';
  purchaseDate: string;
}

export interface Payout {
  _id: string;
  amount: number;
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';
  paymentMethod: 'bank_transfer' | 'upi';
  processedAt?: string;
  transactionId?: string;
  rejectionReason?: string;
  createdAt: string;
}

const creatorService = {
  // Become a creator
  becomeCreator: async (data: {
    bio: string;
    expertise: string[];
    socialLinks?: CreatorProfile['socialLinks'];
  }) => {
    const response = await apiClient.post('/creator/register', data);
    return response.data;
  },

  // Update creator profile
  updateProfile: async (updates: Partial<CreatorProfile>) => {
    const response = await apiClient.put('/creator/profile', updates);
    return response.data;
  },

  // Upload content
  uploadContent: async (contentData: {
    title: string;
    description: string;
    contentType: string;
    files: Array<{
      url: string;
      publicId: string;
      size: number;
      format: string;
    }>;
    thumbnail?: string;
    targetExams: string[];
    subjectId?: string;
    topicIds?: string[];
    price: number;
    tags?: string[];
  }) => {
    const response = await apiClient.post('/creator/content', contentData);
    return response.data;
  },

  // Get my content
  getMyContent: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/creator/content?${params.toString()}`);
    return response.data;
  },

  // Get creator dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/api/v1/creator/dashboard');
    return response.data;
  },

  // Get earnings
  getEarnings: async (filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const response = await apiClient.get(`/creator/earnings?${params.toString()}`);
    return response.data;
  },

  // Request payout
  requestPayout: async (paymentMethod: 'bank_transfer' | 'upi') => {
    const response = await apiClient.post('/creator/payout/request', {
      paymentMethod,
    });
    return response.data;
  },

  // Get payout history
  getPayouts: async (page: number = 1, limit: number = 20) => {
    const response = await apiClient.get(`/creator/payouts?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Update bank details
  updateBankDetails: async (bankDetails: BankDetails) => {
    const response = await apiClient.post('/creator/bank-details', bankDetails);
    return response.data;
  },

  // Get top content analytics
  getTopContent: async (limit: number = 10, sortBy: 'sales' | 'revenue' | 'views' = 'revenue') => {
    const response = await apiClient.get(`/creator/analytics/top-content?limit=${limit}&sortBy=${sortBy}`);
    return response.data;
  },
};

export default creatorService;

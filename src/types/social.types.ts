export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  profilePicture?: string;
  bio?: string;
  followers?: number;
  following?: number;
  followersList?: string[];
  followingList?: string[];
  targetExams?: Array<{
    _id: string;
    name: string;
    categoryName?: string;
    examCode?: string;
  }>;
  primaryExam?: {
    _id: string;
    name: string;
    categoryName?: string;
    examCode?: string;
  };
}

export interface Post {
  _id: string;
  userId: User | string;
  content: string;
  images?: string[];
  type: 'text' | 'image' | 'poll' | 'achievement' | 'study_tip';
  
  targetExams?: string[];
  examCategories?: string[];
  audienceFilter?: {
    examIds?: string[];
    categories?: string[];
    isPublic: boolean;
  };
  
  poll?: {
    question: string;
    options: {
      text: string;
      votes: number;
      votedBy: string[];
    }[];
    expiresAt: string;
  };
  
  likes: number;
  likedBy: string[];
  comments: number;
  shares: number;
  views: number;
  
  trendingScore: number;
  status: 'draft' | 'published' | 'flagged' | 'removed';
  flagReason?: string;
  hashtags: string[];
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  postId: string;
  userId: User | string;
  content: string;
  likes: number;
  likedBy: string[];
  replyTo?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
  images?: string[];
  type?: 'text' | 'image' | 'poll' | 'achievement' | 'study_tip';
  targetExams?: string[];
  hashtags?: string[];
  poll?: {
    question: string;
    options: {
      text: string;
      votes: number;
    }[];
    expiresAt: string;
  };
}

export interface FeedResponse {
  success: boolean;
  data: Post[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
  };
}

export interface CreatePostResponse {
  success: boolean;
  data: Post;
  message?: string;
}

export interface CommentResponse {
  success: boolean;
  data: Comment[];
}

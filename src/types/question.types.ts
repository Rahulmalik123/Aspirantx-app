export interface QuestionOption {
  text: string;
  image?: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuestionExplanation {
  text: string;
  images?: string[];
  videoUrl?: string;
}

export interface ExamMetadata {
  examId: string;
  examName: string;
  categoryId: string;
  categoryName: string;
}

export interface PYQDetails {
  examId: string;
  year: number;
  shift?: string;
  date?: string;
}

export interface HindiVersion {
  questionText: string;
  options: { text: string }[];
  explanation?: string;
}

export interface Question {
  _id: string;
  questionText: string;
  questionImage?: string;
  questionType: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_in_blank';
  
  options: QuestionOption[];
  correctAnswer: number | number[];
  explanation?: QuestionExplanation;
  
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  conceptId?: string;
  conceptName?: string;
  
  examMetadata: ExamMetadata[];
  isCommon: boolean;
  commonCategories?: string[];
  
  difficulty: 'easy' | 'medium' | 'hard';
  
  isPYQ: boolean;
  pyqDetails?: PYQDetails;
  
  tags: string[];
  
  language: 'en' | 'hi' | 'both';
  hindiVersion?: HindiVersion;
  
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
  averageTimeSpent: number;
  
  verifiedBy?: string;
  verified: boolean;
  reportCount: number;
  likes: number;
  
  isActive: boolean;
  isApproved: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: number | number[];
  isCorrect: boolean;
  timeTaken: number;
  answeredAt: string;
}

export interface DailyPractice {
  _id: string;
  user: string;
  date: string;
  questions: Question[];
  totalQuestions: number;
  completed: boolean;
  correctAnswers: number;
  score: number;
  userAnswers?: UserAnswer[];
  status?: 'pending' | 'in_progress' | 'completed';
}

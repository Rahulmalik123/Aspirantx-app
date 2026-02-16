// Subject & Topic Types for Subject-Wise Test Flow

export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  examIds: string[];
  isCommon: boolean;
  totalTopics: number;
  totalQuestions: number;
  isActive: boolean;
}

export interface Topic {
  _id: string;
  name: string;
  code: string;
  subjectId: string;
  subjectName: string;
  description?: string;
  totalQuestions: number;
  easyQuestions?: number;
  mediumQuestions?: number;
  hardQuestions?: number;
  isActive: boolean;
}

export interface QuestionBank {
  bankId: string;
  questionsCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
}

export interface TestSection {
  name: string;
  subjectId: string;
  questions: number;
  duration?: number;
}

export interface SubjectTest {
  _id: string;
  title: string;
  description: string;
  examId: {
    _id: string;
    name: string;
  };
  type: 'subject_test';
  totalQuestions: number;
  duration: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeMarks?: number;
  isPaid: boolean;
  price: number;
  isActive: boolean;
  questionBanks: QuestionBank[];
  sections: TestSection[];
  instructions?: string[];
  userAttempted?: boolean;
  userPurchased?: boolean;
  totalAttempts?: number;
  averageScore?: number;
}

export interface TestAttempt {
  attemptId: string;
  testId: string;
  userId: string;
  startedAt: string;
  endTime: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  questions: TestQuestion[];
}

export interface TestQuestion {
  _id: string;
  questionText: string;
  options: QuestionOption[];
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  explanation?: string;
}

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface SubmitAnswer {
  questionId: string;
  selectedOption: number | null; // 0-3 or null for skipped
  timeTaken: number; // in seconds
}

export interface TestResult {
  attemptId: string;
  testId: string;
  userId: string;
  score: number;
  totalMarks: number;
  correctAnswers: number;
  wrongAnswers: number;
  skippedQuestions: number;
  timeTaken: number; // in seconds
  rank?: number;
  submittedAt: string;
  status: 'completed';
  answers: AnswerDetail[];
}

export interface AnswerDetail {
  questionId: string;
  selectedOption: number | null;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpent: number;
  skipped: boolean;
}

export interface TestAnalysis {
  attemptId: string;
  testDetails: {
    title: string;
    type: string;
    totalQuestions: number;
    totalMarks: number;
  };
  performance: {
    score: number;
    percentage: number;
    correctAnswers: number;
    wrongAnswers: number;
    skippedQuestions: number;
    accuracy: number;
    rank?: number;
    totalAttempts?: number;
  };
  timings: {
    totalTime: number;
    timeTaken: number;
    averageTimePerQuestion: number;
  };
  sectionWise: SectionAnalysis[];
  topicWise: TopicAnalysis[];
  difficultyWise: DifficultyAnalysis;
}

export interface SectionAnalysis {
  sectionName: string;
  totalQuestions: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number;
  accuracy: number;
}

export interface TopicAnalysis {
  topicName: string;
  correct: number;
  wrong: number;
  accuracy: number;
}

export interface DifficultyAnalysis {
  easy: {
    correct: number;
    wrong: number;
    accuracy: number;
  };
  medium: {
    correct: number;
    wrong: number;
    accuracy: number;
  };
  hard: {
    correct: number;
    wrong: number;
    accuracy: number;
  };
}

export interface UserTestHistory {
  attemptId: string;
  testId: string;
  testTitle: string;
  testType: string;
  score: number;
  totalMarks: number;
  percentage: number;
  rank?: number;
  totalAttempts?: number;
  submittedAt: string;
  status: 'completed' | 'in_progress' | 'abandoned';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

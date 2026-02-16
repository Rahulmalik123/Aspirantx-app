// Tournament Types
export interface Tournament {
  _id: string;
  title: string; // API uses 'title' not 'name'
  name?: string; // Backward compatibility
  description: string;
  examId?: string;
  targetExams?: string[]; // API uses targetExams
  testId?: string;
  isOpenToAll?: boolean;
  type?: 'free' | 'paid';
  startTime?: string;
  endTime?: string;
  startDate?: string; // API might use startDate
  endDate?: string; // API might use endDate
  registrationEndTime?: string;
  entryFee: number;
  prizePool: number;
  prizes?: PrizeDistribution[]; // API uses 'prizes' not 'prizeDistribution'
  prizeDistribution?: PrizeDistribution[];
  maxParticipants?: number;
  currentParticipants?: number;
  participants?: number; // API might use this
  status?: TournamentStatus;
  duration?: number;
  totalQuestions?: number;
  questions?: string[]; // API includes questions array
  totalMarks?: number;
  rules?: string[];
  bannerImage?: string;
  isJoined?: boolean;
  userRank?: number;
  userScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrizeDistribution {
  rank: string;
  amount: number;
  percentage: number;
}

export type TournamentStatus = 'upcoming' | 'live' | 'completed';

export interface TournamentParticipant {
  _id: string;
  tournamentId: string;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  rank: number;
  timeTaken: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  attemptedQuestions: number;
  attemptId?: string;
  joinedAt: string;
  completedAt?: string;
}

export interface TournamentLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  timeTaken: number;
  accuracy: number;
  correctAnswers: number;
  incorrectAnswers: number;
  attemptedQuestions: number;
}

// Request Filters
export interface TournamentFilters {
  examId?: string;
  status?: TournamentStatus;
  minEntryFee?: number;
  maxEntryFee?: number;
  minPrize?: number;
  maxPrize?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardFilters {
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}

export interface MyTournamentsFilters {
  status?: TournamentStatus;
  page?: number;
  limit?: number;
}

// Response Types
export interface TournamentListResponse {
  tournaments: Tournament[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface TournamentDetailsResponse {
  tournament: Tournament;
  participantCount: number;
  topParticipants?: TournamentLeaderboardEntry[];
}

export interface LeaderboardResponse {
  leaderboard: TournamentLeaderboardEntry[];
  total: number;
  userRank?: number;
  currentPage: number;
  totalPages: number;
}

export interface JoinTournamentResponse {
  success: boolean;
  message: string;
  tournamentId: string;
  participantId: string;
}

export interface TournamentTestStartResponse {
  attemptId: string;
  test: any;
  startTime: string;
  questions: any[];
}

export interface TournamentTestSubmitRequest {
  answers: Array<{
    questionId: string;
    selectedOption: number;
    timeTaken: number;
  }>;
  timeTaken: number;
}

export interface TournamentTestSubmitResponse {
  success: boolean;
  score: number;
  rank?: number;
  message: string;
}

export interface TournamentTestResultsResponse {
  attempt: any;
  score: number;
  percentage: number;
  rank: number;
  totalParticipants: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeTaken: number;
  solutions?: any[];
}

export interface TournamentStatsResponse {
  totalParticipants: number;
  averageScore?: number;
  highestScore?: number;
  completionRate?: number;
}

export interface CanJoinTournamentResponse {
  canJoin: boolean;
  reason?: string;
}

// Redux State
export interface TournamentState {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  myTournaments: Tournament[];
  leaderboard: TournamentLeaderboardEntry[];
  loading: boolean;
  error: string | null;
  filters: TournamentFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
}

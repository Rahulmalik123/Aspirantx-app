import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

// Types
export interface Tournament {
  _id: string;
  name: string;
  description: string;
  examId: string;
  testId: string;
  startTime: string;
  endTime: string;
  registrationEndTime: string;
  entryFee: number;
  prizePool: number;
  prizeDistribution?: Array<{
    rank: string;
    amount: number;
    percentage: number;
  }>;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'live' | 'completed';
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  rules?: string[];
  bannerImage?: string;
  isJoined?: boolean;
  userRank?: number;
  userScore?: number;
}

export interface TournamentParticipant {
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

export interface TournamentFilters {
  examId?: string;
  status?: 'upcoming' | 'live' | 'completed';
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

export interface TournamentDetailsResponse {
  tournament: Tournament;
  participantCount: number;
  topParticipants?: TournamentParticipant[];
}

export interface JoinTournamentResponse {
  success: boolean;
  message: string;
  tournamentId: string;
  participantId: string;
}

export interface MyTournamentsFilters {
  status?: 'upcoming' | 'live' | 'completed';
  page?: number;
  limit?: number;
}

// Tournament Service
class TournamentService {
  /**
   * 📱 DISCOVERY & BROWSE
   */

  // 1. GET / - List active tournaments (Public - No Auth)
  async getTournaments(filters?: TournamentFilters) {
    const response = await apiClient.get(ENDPOINTS.TOURNAMENTS, { 
      params: filters 
    });
    // Handle nested response: { data: { data: [], pagination: {} } }
    return {
      tournaments: response.data?.data || response.data || [],
      ...response.data?.pagination,
    };
  }

  // 2. GET /details/:tournamentId - Tournament details (Public - No Auth)
  async getTournamentDetails(tournamentId: string): Promise<TournamentDetailsResponse> {
    const response = await apiClient.get(ENDPOINTS.TOURNAMENT_DETAILS(tournamentId));
    // Response format: { data: { tournament_data } }
    const tournamentData = response.data || response;
    return {
      tournament: tournamentData,
      participantCount: tournamentData.currentParticipants || tournamentData.participants || 0,
      topParticipants: [],
    };
  }

  // 3. GET /leaderboard/:tournamentId - Live leaderboard (Public - No Auth)
  async getTournamentLeaderboard(
    tournamentId: string, 
    filters?: LeaderboardFilters
  ): Promise<{
    leaderboard: TournamentParticipant[];
    total: number;
    userRank?: number;
    currentPage: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(
      ENDPOINTS.TOURNAMENT_LEADERBOARD(tournamentId),
      { params: filters }
    );
    return {
      leaderboard: response.data?.data || response.data || [],
      total: response.data?.pagination?.total || 0,
      currentPage: response.data?.pagination?.page || 1,
      totalPages: response.data?.pagination?.totalPages || 1,
      userRank: response.data?.userRank,
    };
  }

  /**
   * 🔐 PARTICIPATION (Auth Required)
   */

  // 4. POST /join/:tournamentId - Join tournament (Auth Required)
  async joinTournament(tournamentId: string): Promise<JoinTournamentResponse> {
    const response = await apiClient.post(ENDPOINTS.JOIN_TOURNAMENT(tournamentId));
    return response.data || response;
  }

  // 5. GET /my-tournaments - User's tournament history (Auth Required)
  async getMyTournaments(filters?: MyTournamentsFilters): Promise<{
    tournaments: Tournament[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(ENDPOINTS.MY_TOURNAMENTS, { 
      params: filters 
    });
    return {
      tournaments: response.data?.data || response.data || [],
      total: response.data?.pagination?.total || 0,
      currentPage: response.data?.pagination?.page || 1,
      totalPages: response.data?.pagination?.totalPages || 1,
    };
  }

  /**
   * 🎮 TEST ATTEMPT (via Test APIs)
   * These methods use the test service endpoints but are included here for convenience
   */

  // 6. POST /api/tests/:testId/start - Start tournament test (Auth Required)
  async startTournamentTest(testId: string): Promise<{
    attemptId: string;
    test: any;
    startTime: string;
    questions: any[];
  }> {
    const response = await apiClient.post(`/api/v1/tests/${testId}/start`);
    return response.data;
  }

  // 7. POST /api/tests/submit/:attemptId - Submit answers (Auth Required)
  async submitTournamentTest(
    attemptId: string, 
    data: {
      answers: Array<{
        questionId: string;
        selectedOption: number;
        timeTaken: number;
      }>;
      timeTaken: number;
    }
  ): Promise<{
    success: boolean;
    score: number;
    rank?: number;
    message: string;
  }> {
    const response = await apiClient.post(
      `/api/v1/tests/submit/${attemptId}`,
      data
    );
    return response.data;
  }

  // 8. GET /api/tests/results/:attemptId - View results (Auth Required)
  async getTournamentTestResults(attemptId: string): Promise<{
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
  }> {
    const response = await apiClient.get(`/api/v1/tests/results/${attemptId}`);
    return response.data;
  }

  /**
   * UTILITY METHODS
   */

  // Check if user can join tournament
  async canJoinTournament(tournamentId: string): Promise<{
    canJoin: boolean;
    reason?: string;
  }> {
    try {
      const details = await this.getTournamentDetails(tournamentId);
      const tournament = details.tournament;

      // Check status
      if (tournament.status !== 'upcoming') {
        return { 
          canJoin: false, 
          reason: 'Tournament is not in upcoming status' 
        };
      }

      // Check max participants
      if (tournament.currentParticipants >= tournament.maxParticipants) {
        return { 
          canJoin: false, 
          reason: 'Tournament is full' 
        };
      }

      // Check if already joined
      if (tournament.isJoined) {
        return { 
          canJoin: false, 
          reason: 'Already joined this tournament' 
        };
      }

      return { canJoin: true };
    } catch (error) {
      return { 
        canJoin: false, 
        reason: 'Failed to check tournament status' 
      };
    }
  }

  // Get tournament statistics
  async getTournamentStats(tournamentId: string): Promise<{
    totalParticipants: number;
    averageScore?: number;
    highestScore?: number;
    completionRate?: number;
  }> {
    const response = await apiClient.get(
      `/api/v1/tournaments/${tournamentId}/stats`
    );
    return response.data;
  }
}

export default new TournamentService();

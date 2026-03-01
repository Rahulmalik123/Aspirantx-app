import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface BattleQuestion {
  _id: string;
  questionText: string;
  options: { text: string }[];
  correctAnswer?: number;
  difficulty: string;
}

export interface BattleParticipant {
  _id: string;
  name: string;
  profilePic?: string;
}

export interface Battle {
  _id: string;
  exam?: { _id: string; name: string };
  subject?: { _id: string; name: string };
  creator?: BattleParticipant;
  opponent?: BattleParticipant;
  winner?: BattleParticipant;
  questions: BattleQuestion[] | string[];
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  entryFee: number;
  prizePool: number;
  platformCut: number;
  coinType: 'paid' | 'free';
  isFree: boolean;
  isDraw: boolean;
  status: 'waiting' | 'ongoing' | 'completed' | 'cancelled';
  creatorScore?: number;
  opponentScore?: number;
  creatorCompleted?: boolean;
  opponentCompleted?: boolean;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  inviteType: 'open' | 'link' | 'direct';
  inviteCode?: string;
  challengedUser?: BattleParticipant;
  myAnsweredCount?: number;
}

export interface CreateBattleParams {
  examId: string;
  subjectId: string;
  entryFee: number;
  totalQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  coinType?: 'paid' | 'free';
  inviteType?: 'open' | 'link' | 'direct';
  challengedUserId?: string;
}

export interface AvailableBattlesParams {
  page?: number;
  limit?: number;
  isFree?: boolean;
  difficulty?: string;
  examId?: string;
  subjectId?: string;
}

export interface SubmitAnswerParams {
  questionId: string;
  selectedOption: number;
  timeTaken: number;
}

class BattleService {
  async createBattle(params: CreateBattleParams): Promise<Battle> {
    const response: any = await apiClient.post(ENDPOINTS.CREATE_BATTLE, params);
    return response?.data ?? response;
  }

  async getAvailableBattles(params?: AvailableBattlesParams): Promise<{ data: Battle[]; pagination: any }> {
    const response: any = await apiClient.get(ENDPOINTS.AVAILABLE_BATTLES, { params });
    return response?.data ?? response;
  }

  async joinBattle(battleId: string): Promise<Battle> {
    const response: any = await apiClient.post(ENDPOINTS.JOIN_BATTLE(battleId));
    return response?.data ?? response;
  }

  async getBattle(battleId: string): Promise<Battle> {
    const response: any = await apiClient.get(ENDPOINTS.BATTLE_DETAILS(battleId));
    return response?.data ?? response;
  }

  async submitAnswer(battleId: string, params: SubmitAnswerParams): Promise<{ isCorrect: boolean; correctAnswer: number }> {
    const response: any = await apiClient.post(ENDPOINTS.SUBMIT_BATTLE_ANSWER(battleId), params);
    return response?.data ?? response;
  }

  async getBattleResults(battleId: string): Promise<{
    battle: Battle;
    creatorScore: number;
    opponentScore: number;
    bothCompleted: boolean;
  }> {
    const response: any = await apiClient.get(ENDPOINTS.BATTLE_RESULT(battleId));
    return response?.data ?? response;
  }

  async getUserBattles(params?: { status?: string; page?: number }): Promise<{ data: Battle[] }> {
    const response: any = await apiClient.get(ENDPOINTS.MY_BATTLES, { params });
    return response?.data ?? response;
  }

  async getPendingChallenges(): Promise<Battle[]> {
    const response: any = await apiClient.get(ENDPOINTS.PENDING_CHALLENGES);
    return response?.data ?? response ?? [];
  }

  async joinByCode(code: string): Promise<Battle> {
    const response: any = await apiClient.post(ENDPOINTS.JOIN_BATTLE_BY_CODE(code));
    return response?.data ?? response;
  }

  async declineChallenge(battleId: string): Promise<void> {
    await apiClient.post(ENDPOINTS.DECLINE_CHALLENGE(battleId));
  }

  async challengeUser(params: CreateBattleParams): Promise<Battle> {
    const response: any = await apiClient.post(ENDPOINTS.CREATE_BATTLE, {
      ...params,
      inviteType: 'direct',
    });
    return response?.data ?? response;
  }
}

export default new BattleService();

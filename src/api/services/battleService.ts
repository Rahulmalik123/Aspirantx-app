import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface Battle {
  _id: string;
  opponent?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: 'waiting' | 'active' | 'completed';
  entryFee: number;
  questions: string[];
  myScore?: number;
  opponentScore?: number;
  winner?: string;
}

class BattleService {
  async findOpponent(entryFee: number): Promise<{ battleId: string; opponent: any }> {
    return apiClient.post(ENDPOINTS.FIND_OPPONENT, { entryFee });
  }

  async createBattle(entryFee: number): Promise<{ battleId: string }> {
    return apiClient.post(ENDPOINTS.CREATE_BATTLE, { entryFee });
  }

  async joinBattle(battleId: string): Promise<{ success: boolean; battle: Battle }> {
    return apiClient.post(ENDPOINTS.JOIN_BATTLE(battleId));
  }

  async getBattle(battleId: string): Promise<Battle> {
    return apiClient.get(ENDPOINTS.BATTLE_DETAILS(battleId));
  }

  async submitAnswer(battleId: string, data: { questionId: string; answer: number }): Promise<{ correct: boolean; score: number }> {
    return apiClient.post(ENDPOINTS.SUBMIT_BATTLE_ANSWER(battleId), data);
  }

  async getBattleResult(battleId: string): Promise<Battle> {
    return apiClient.get(ENDPOINTS.BATTLE_RESULT(battleId));
  }

  async getBattleHistory(): Promise<Battle[]> {
    return apiClient.get(ENDPOINTS.BATTLE_HISTORY);
  }
}

export default new BattleService();

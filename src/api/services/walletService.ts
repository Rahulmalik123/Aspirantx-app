import apiClient from '../client';
import { ENDPOINTS } from '../endpoints';

export interface WalletData {
  balance: number;          // Paid coins (withdrawable)
  freeBalance: number;      // Free/bonus coins (battles/tournaments only)
  totalBalance: number;
  totalEarnings: number;
  totalSpent: number;
  totalFreeEarned: number;
  totalFreeSpent: number;
}

export interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  coinType: 'paid' | 'free';
  description: string;
  source?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface CoinPackage {
  _id: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
}

class WalletService {
  async getWallet(): Promise<WalletData> {
    return apiClient.get(ENDPOINTS.WALLET);
  }

  async recharge(packageId: string): Promise<{ orderId: string; amount: number }> {
    return apiClient.post(ENDPOINTS.RECHARGE, { packageId });
  }

  async getTransactions(page = 1, limit = 20): Promise<{ transactions: Transaction[]; total: number }> {
    return apiClient.get(ENDPOINTS.TRANSACTIONS, { params: { page, limit } });
  }

  async getEarnings(): Promise<any> {
    return apiClient.get(ENDPOINTS.EARNINGS);
  }

  async getCoinPackages(): Promise<CoinPackage[]> {
    return apiClient.get(ENDPOINTS.COIN_PACKAGES);
  }

  async withdraw(amount: number, upiId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post(ENDPOINTS.WITHDRAW, { amount, upiId });
  }
}

export default new WalletService();

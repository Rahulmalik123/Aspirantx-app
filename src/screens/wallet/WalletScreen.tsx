import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';
import walletService, { Transaction } from '../../api/services/walletService';

const WalletScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState(user?.coins || 0);
  const [freeBalance, setFreeBalance] = useState(0);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(1, 20),
      ]);

      // Use coins from wallet response, fallback to user coins
      const walletData = walletRes?.data ?? walletRes;
      if (walletData?.balance !== undefined) {
        setBalance(walletData.balance);
        setFreeBalance(walletData.freeBalance || 0);
      } else if (user?.coins !== undefined) {
        setBalance(user.coins);
      }
      
      if (transactionsRes?.data?.data) {
        setTransactions(transactionsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Fallback to user coins on error
      if (user?.coins !== undefined) {
        setBalance(user.coins);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit': return '↓';
      case 'debit': return '↑';
      default: return '•';
    }
  };

  const getTransactionColor = (type: string) => {
    return type.toLowerCase() === 'credit' ? '#10B981' : '#EF4444';
  };

  return (
    <View style={styles.container}>
      <Header
        title="My Wallet"
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.content}>
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Text style={styles.balanceValue}>{balance + freeBalance} coins</Text>
              <View style={styles.balanceBreakdown}>
                <View style={styles.balanceItem}>
                  <View style={[styles.coinDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.balanceItemLabel}>Paid</Text>
                  <Text style={styles.balanceItemValue}>{balance}</Text>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceItem}>
                  <View style={[styles.coinDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.balanceItemLabel}>Free</Text>
                  <Text style={styles.balanceItemValue}>{freeBalance}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.rechargeButton}
                onPress={() => navigation.navigate('Recharge')}
              >
                <Text style={styles.rechargeButtonText}>Recharge Wallet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No transactions yet</Text>
                </View>
              ) : (
                transactions.map((txn) => (
                  <View key={txn._id} style={styles.transactionCard}>
                    <View style={[
                      styles.transactionIcon,
                      { backgroundColor: getTransactionColor(txn.type) + '20' }
                    ]}>
                      <Text style={[styles.iconText, { color: getTransactionColor(txn.type) }]}>
                        {getTransactionIcon(txn.type)}
                      </Text>
                    </View>
                    <View style={styles.transactionContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.transactionSource}>{txn.description || 'Transaction'}</Text>
                        {txn.coinType === 'free' && (
                          <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>FREE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.transactionDate}>
                        {new Date(txn.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(txn.type) }
                    ]}>
                      {txn.type === 'credit' ? '+' : '-'}{txn.amount}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 20,
  },
  balanceBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceItemLabel: {
    fontSize: 13,
    color: '#E0E7FF',
  },
  balanceItemValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  balanceDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  rechargeButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  rechargeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  transactionContent: {
    flex: 1,
  },
  transactionSource: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  freeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#92400E',
  },
});

export default WalletScreen;

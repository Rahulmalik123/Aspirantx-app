import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface Transaction {
  _id: string;
  type: 'credit' | 'debit';
  amount: number;
  source: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      _id: '1',
      type: 'credit',
      amount: 100,
      source: 'Wallet Recharge',
      status: 'success',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      type: 'debit',
      amount: 50,
      source: 'Battle Entry',
      status: 'success',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '3',
      type: 'credit',
      amount: 75,
      source: 'Battle Win',
      status: 'success',
      createdAt: new Date().toISOString(),
    },
  ]);

  const getTypeIcon = (type: string) => {
    return type === 'credit' ? '↓' : '↑';
  };

  const getTypeColor = (type: string) => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return { text: 'Success', bg: '#D1FAE5', color: '#065F46' };
      case 'pending':
        return { text: 'Pending', bg: '#FEF3C7', color: '#92400E' };
      case 'failed':
        return { text: 'Failed', bg: '#FEE2E2', color: '#991B1B' };
      default:
        return { text: 'Unknown', bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const statusBadge = getStatusBadge(item.status);

    return (
      <View style={styles.transactionCard}>
        <View style={[
          styles.iconCircle,
          { backgroundColor: getTypeColor(item.type) + '20' }
        ]}>
          <Text style={[styles.iconText, { color: getTypeColor(item.type) }]}>
            {getTypeIcon(item.type)}
          </Text>
        </View>

        <View style={styles.transactionContent}>
          <Text style={styles.transactionSource}>{item.source}</Text>
          <Text style={styles.transactionDate}>{formatDate(item.createdAt)}</Text>
        </View>

        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            { color: getTypeColor(item.type) }
          ]}>
            {item.type === 'credit' ? '+' : '-'}🪙 {item.amount}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Transaction History"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButtonOutline}>
          <Text style={styles.filterTextOutline}>Credit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButtonOutline}>
          <Text style={styles.filterTextOutline}>Debit</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  filterButtonOutline: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  filterTextOutline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  list: {
    padding: 20,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
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
    fontSize: 12,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default TransactionHistoryScreen;
